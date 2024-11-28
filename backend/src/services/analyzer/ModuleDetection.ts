import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import { CodeBlockInfo, FileAnalyzeInfo } from "./types";
import { ModuleNaming } from "./ModuleNaming";
import { createSHA256 } from "@/utils/createSHA256";
import disparity from "graphology-metrics/edge/disparity";
import centrality from "graphology-metrics/centrality/edge-betweenness";
import { JaroWinklerDistance } from "natural";
import { subgraph } from "graphology-operators";

type CodeBlock = CodeBlockInfo & { path: string };

export class ModuleDetection {
  private moduleNaming = new ModuleNaming();
  private rootGraph = new Graph({ multi: false, type: "directed" });

  constructor(fileAnalyzeInfo: FileAnalyzeInfo[]) {
    this.buildRootGraph(fileAnalyzeInfo);
  }

  private buildRootGraph(fileAnalyzeInfo: FileAnalyzeInfo[]) {
    const blocks = fileAnalyzeInfo.flatMap((file) =>
      file.blocks.map((block) => ({
        ...block,
        path: file.path,
      }))
    );

    const blockIndex = new Map<string, CodeBlock>();
    blocks.forEach((block) => {
      this.moduleNaming.addDocument(block.name);
      this.rootGraph.addNode(block.hash, block);
      blockIndex.set(block.hash, block);
    });

    console.log("calculando score de paths.");
    const pathScores: Record<string, Record<string, number>> = {};
    const paths = [...new Set(blocks.map((block) => block.path))];
    paths.forEach((pathA, indexA) => {
      pathScores[pathA] = {};
      paths.forEach((pathB) => {
        const pathScore = this.calculatePathScore(pathA, pathB);

        pathScores[pathA][pathB] = pathScore;
        pathScores[pathB] = pathScores[pathB] || {};
        pathScores[pathB][pathA] = pathScore;
      });
    });

    console.log("calculando score de paths.", pathScores);

    console.log("adicionando relacionamentos.");
    blocks.forEach((sourceBlock) => {
      blocks
        .filter((targetBlock) => targetBlock.hash !== sourceBlock.hash)
        .forEach((targetBlock) => {
          const pathScore = pathScores[sourceBlock.path][targetBlock.path];
          console.log("pathScore", pathScore);

          const nameScore = this.calculateNameScore(
            sourceBlock.name,
            targetBlock.name
          );
          const isDependency = sourceBlock.dependencies.some(
            (dep) => dep.hash === targetBlock.hash
          );
          const dependencyScore = isDependency ? 1 : 0;

          const score = (pathScore + nameScore + dependencyScore) / 3;

          if (score >= 0.33) {
            this.rootGraph.addEdge(sourceBlock.hash, targetBlock.hash, {
              weight: score,
            });
          }
        });
    });
    console.log("finalizado relacionamentos.");
  }

  private calculateNameScore(nameA: string, nameB: string) {
    const termsA = this.moduleNaming.tokenize(nameA);
    const meanTermAScore =
      termsA
        .map((term) => this.moduleNaming.getScoreTerm(term))
        .reduce((acc, cur) => acc + cur, 0) / termsA.length;
    const termsB = this.moduleNaming.tokenize(nameB);
    const meanTermBScore =
      termsB
        .map((term) => this.moduleNaming.getScoreTerm(term))
        .reduce((acc, cur) => acc + cur, 0) / termsB.length;

    const tfidf = (meanTermAScore + meanTermBScore) / 2;
    const jaro = JaroWinklerDistance(nameA, nameB);

    return (tfidf + jaro) / 2;
  }

  private calculatePathScore(pathA: string, pathB: string) {
    const termsPathA = Math.max(
      ...this.moduleNaming
        .tokenize(pathA)
        .map((term) => this.moduleNaming.getScoreTerm(term))
    );
    const termsPathB = Math.max(
      ...this.moduleNaming
        .tokenize(pathB)
        .map((term) => this.moduleNaming.getScoreTerm(term))
    );
    return (
      (JaroWinklerDistance(pathA, pathB) + Math.max(termsPathA, termsPathB)) / 2
    );
  }

  private withMetrics(graph: Graph) {
    // const tmpGraph = graph.copy({ multi: false, type: "directed" });

    disparity.assign(graph, {
      getEdgeWeight: "weight",
      edgeDisparityAttribute: "disparity",
    });
    // const disparityMapping = disparity(graph, {
    //   getEdgeWeight: "weight",
    //   edgeDisparityAttribute: "disparity",
    // });
    // console.log("disparityMapping", disparityMapping);

    centrality.assign(graph, {
      normalized: true,
      edgeCentralityAttribute: "centrality",
      getEdgeWeight: "disparity",
    });
    // const centralityMapping = centrality(graph, {
    //   normalized: true,
    //   edgeCentralityAttribute: "centrality",
    //   getEdgeWeight: "disparity",
    // });
    // console.log("centralityMapping", centralityMapping);

    return graph;
  }

  private mappingCommunities(graph: Graph, resolution: 1) {
    louvain.assign(graph, {
      resolution,
      randomWalk: false,
      getEdgeWeight: (edge, attributes) => {
        return (
          (attributes.disparity + attributes.weight + attributes.centrality) / 3
        );
      },
    });

    const louvainMapping = louvain(graph, {
      resolution,
      randomWalk: false,
      getEdgeWeight: (edge, attributes) => {
        return (
          (attributes.disparity *
            attributes.weight *
            Math.max(attributes.centrality)) /
          3
        );
      },
    });
    // console.log("louvainMapping", louvainMapping);
    return Object.entries(louvainMapping).reduce(
      (acc, [nodeId, communityId]) => ({
        ...acc,
        [`${communityId}`]: [...(acc[`${communityId}`] || []), nodeId],
      }),
      {} as { [communityId: string]: string[] }
    );
  }

  private buildHierarchy(graph: Graph, level: number) {
    const withMetrics = this.withMetrics(graph);
    const communities = this.mappingCommunities(withMetrics, 1);
    const communitiesArray = Object.entries(communities);

    return communitiesArray.length > 1
      ? communitiesArray.map(([communityId, nodes]) => {
          const sub = subgraph(withMetrics, (key, attr) => {
            return attr.community.toString() === communityId;
          });
          const nodesWithAttr = nodes.map(
            (nodeId) => withMetrics.getNodeAttributes(nodeId) as CodeBlock
          );
          const moduleName = this.generateModuleName(
            nodesWithAttr.map(({ name }) => name)
          );
          return {
            id: createSHA256(`${level}-${moduleName}`),
            name: moduleName,
            level: level + 1,
            nodes: nodesWithAttr,
            submodules:
              nodesWithAttr.length > 1
                ? this.buildHierarchy(sub, level + 1)
                : undefined,
          };
        })
      : undefined;
  }

  buildModuleHierarchy() {
    return this.buildHierarchy(this.rootGraph, 0);
  }

  private generateModuleName(names: string[]): string {
    const naming = new ModuleNaming();

    names.forEach((name) => {
      naming.addDocument(name);
    });

    return naming.inferName().join(" ").trim() || "Unknown";
  }
}
