import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import { CodeBlockInfo, ProjectAnalysis } from "../types";
import { createSHA256 } from "@/utils/createSHA256";
import disparity from "graphology-metrics/edge/disparity";
import centrality from "graphology-metrics/centrality/edge-betweenness";
import { subgraph } from "graphology-operators";
import { KeywordExtractor } from "./KeywordExtractor";
import { writeFileSync } from "node:fs";
import { ModuleIdentifier } from "./KeywordPatternAnalyzer";

type CodeBlock = CodeBlockInfo & { path: string };

export class ModuleDetection {
  private rootGraph = new Graph({ multi: false, type: "directed" });

  constructor(projectAnalyses: ProjectAnalysis[]) {
    this.buildRootGraph(projectAnalyses);
  }

  private buildRootGraph(projectAnalyses: ProjectAnalysis[]) {
    const extractor = new KeywordExtractor();

    const blocks = new Map<string, CodeBlock>();
    projectAnalyses.forEach((analysis) => {
      analysis.analysis.fileAnalysis.forEach((file) => {
        file.blocks.forEach((block) => {
          delete block.content;
          delete block.dependencies;

          if (!this.rootGraph.hasNode(block.hash)) {
            const document = `${file.path.replace(analysis.project, "").replace("/src", "")} ${block.name} `;

            extractor.addDocument(document, block.hash);
            this.rootGraph.addNode(block.hash, {
              ...block,
              x: 1,
              y: 1,
              size: 1,
              label: block.name,
              document: document,
              path: file.path,
              type_node: "code_block",
            });

            blocks.set(block.hash, {
              ...block,
              path: file.path,
            });
          }
        });
      });
    });

    extractor.classify();

    const documents = new Map<string, string[]>();

    blocks.forEach((sourceBlock) => {
      const keywords = extractor.getDocumentKeywords(sourceBlock.hash);

      documents.set(
        sourceBlock.hash,
        keywords.map((value) => value.keyword)
      );

      const averageSourceScore =
        keywords.reduce((sum, value) => sum + value.score, 0) / keywords.length;

      this.rootGraph.setNodeAttribute(
        sourceBlock.hash,
        "keywords",
        keywords.map((value) => value.keyword)
      );

      keywords.forEach((value) => {
        if (!this.rootGraph.hasNode(value.keyword)) {
          this.rootGraph.addNode(value.keyword, {
            ...value,
            x: 1,
            y: 1,
            size: value.score,
            label: value.keyword,
            type_node: "keyword",
          });
        }

        this.rootGraph.addEdge(sourceBlock.hash, value.keyword, {
          weight: value.score,
        });
      });

      sourceBlock.dependencies
        ?.filter((dep) => blocks.has(dep.hash))
        .forEach((targetBlock) => {
          const targetKeywords = extractor.getDocumentKeywords(
            targetBlock.hash
          );
          const averageTargetScore =
            targetKeywords.reduce((sum, value) => sum + value.score, 0) /
            targetKeywords.length;

          const sharedKeywords = keywords.filter((value) =>
            targetKeywords.some((tgKey) => tgKey.keyword == value.keyword)
          );
          const averageSharedScore =
            sharedKeywords.reduce((sum, value) => sum + value.score, 0) /
            sharedKeywords.length;

          this.rootGraph.addEdge(sourceBlock.hash, targetBlock.hash, {
            weight:
              (averageSourceScore + averageSharedScore + averageTargetScore) /
              3,
          });
        });
    });

    const cluster = new ModuleIdentifier();
    cluster.analyzeSourceModules(
      Array.from(documents.entries()).map(([id, keywords]) => ({
        id,
        keywords,
      }))
    );

    writeFileSync(
      `graph.json`,
      JSON.stringify(this.rootGraph.export(), null, 2)
    );
  }

  private withMetrics(graph: Graph) {
    if (graph.size > 0) {
      disparity.assign(graph, {
        getEdgeWeight: (edge, attr) => attr.weight || 1.0,
        edgeDisparityAttribute: "disparity",
      });

      centrality.assign(graph, {
        normalized: false,
        edgeCentralityAttribute: "centrality",
        getEdgeWeight: (edge, attr) => attr.weight || 1.0,
      });
    }

    return graph;
  }

  private mappingCommunities(graph: Graph, resolution: number = 1) {
    louvain.assign(graph, {
      resolution,
      randomWalk: false,
      getEdgeWeight: (edge, attributes) => {
        return attributes.weight * attributes.centrality * attributes.disparity;
      },
    });

    return graph
      .mapNodes((node, attr) => [node, String(attr.community)])
      .reduce(
        (acc, [nodeId, communityId]) => ({
          ...acc,
          [`${communityId}`]: [...(acc[`${communityId}`] || []), nodeId],
        }),
        {} as { [communityId: string]: string[] }
      );
  }

  buildModuleHierarchy() {
    const hierarchyStack: {
      graph: Graph;
      level: number;
      parentId?: string;
    }[] = [{ graph: this.rootGraph, level: 0 }];

    const finalHierarchy: any[] = [];

    while (hierarchyStack.length > 0) {
      const { graph, level, parentId } = hierarchyStack.pop()!;

      const withMetrics = this.withMetrics(graph);

      const communities = this.mappingCommunities(withMetrics, 4);
      const communitiesArray = Object.entries(communities);

      if (communitiesArray.length <= 1) continue;

      const extractor = new KeywordExtractor();

      const moduleMappings = communitiesArray
        .filter(([, nodes]) =>
          nodes.some(
            (nodeId) =>
              withMetrics.getNodeAttributes(nodeId).type_node === "code_block"
          )
        )
        .map(([communityId, nodes]) => {
          const nodesAttr = nodes
            .map((nodeId) => withMetrics.getNodeAttributes(nodeId))
            .filter((node) => node.type_node == "code_block");

          extractor.addDocument(
            nodesAttr.map((node) => node.document).join(" "),
            communityId
          );

          return { communityId, nodesAttr };
        });

      extractor.classify();

      const moduleResults = moduleMappings.map(({ communityId, nodesAttr }) => {
        const keywords = extractor.getDocumentKeywords(communityId);
        const moduleName = this.generateModuleName(keywords);

        const sub = subgraph(withMetrics, (key, attr) => {
          return attr.community.toString() === communityId;
        });

        const moduleInfo = {
          id: createSHA256(`${level}-${moduleName}`),
          name: moduleName,
          level: level + 1,
          nodes: nodesAttr,
          parentId: parentId,
        };

        if (sub.size !== graph.size && sub.size > 2) {
          hierarchyStack.push({
            graph: sub,
            level: level + 1,
            parentId: moduleInfo.id,
          });
        }

        return moduleInfo;
      });

      finalHierarchy.push(...moduleResults);
    }

    return this.organizeHierarchy(finalHierarchy);
  }

  private organizeHierarchy(flatHierarchy: any[]) {
    const hierarchyMap = new Map<string, any>();
    const rootModules: any[] = [];

    flatHierarchy.forEach((module) => {
      hierarchyMap.set(module.id, {
        ...module,
        submodules: [],
      });
    });

    hierarchyMap.forEach((module) => {
      if (module.parentId) {
        const parent = hierarchyMap.get(module.parentId);
        if (parent) {
          parent.submodules.push(module);
        }
      } else {
        rootModules.push(module);
      }
    });

    return rootModules;
  }

  private generateModuleName(
    keywords: { keyword: string; score: number }[]
  ): string {
    return keywords
      .sort((a, b) => b.score - a.score)
      .slice(
        0,
        Math.max(
          1,
          Math.min(
            Math.floor(Math.log(keywords.length) / Math.log(Math.E) + 1),
            4
          )
        )
      )
      .sort()
      .map(({ keyword }) => keyword)
      .join(" ");
  }
}
