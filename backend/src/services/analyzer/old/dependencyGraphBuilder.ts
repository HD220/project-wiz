import * as graphlib from "@dagrejs/graphlib";
import { BlockInfo, FileAnalysis } from "./types";
import { generateModuleName } from "@/utils/generateModuleName";

export class DependencyGraphBuilder {
  private graph: graphlib.Graph;
  private fileAnalyses: FileAnalysis[];

  constructor() {
    this.graph = new graphlib.Graph({ directed: true });
    this.fileAnalyses = [];
  }

  public addFileAnalysis(analysis: FileAnalysis): void {
    this.fileAnalyses.push(analysis);
  }

  public buildGraph(): graphlib.Graph {
    // Adicionar todos os blocos como nós
    this.fileAnalyses.forEach((analysis) => {
      analysis.blocks.forEach((block) => {
        const filePath = analysis.filePath
          .replace(".ts", "")
          .replace(".tsx", "");
        const nodeId = `${filePath}:${block.name}`;
        this.graph.setNode(nodeId, {
          ...block,
          id: nodeId,
        });
      });
    });

    // Adicionar as arestas baseadas nas dependências
    this.fileAnalyses.forEach((analysis) => {
      analysis.blocks.forEach((block) => {
        const filePath = analysis.filePath
          .replace(".ts", "")
          .replace(".tsx", "");
        const sourceNodeId = `${filePath}:${block.name}`;

        // Processar cada dependência do bloco
        Object.entries(block.externalDependencies).forEach(
          ([depName, depInfo]) => {
            const targetNodeId =
              depInfo.type === "import"
                ? `${depInfo.filePath}:${depName}`
                : `${analysis.filePath.replace(".ts", "").replace(".tsx", "")}:${depName}`;

            if (targetNodeId && this.graph.hasNode(`${targetNodeId}`)) {
              this.graph.setEdge(sourceNodeId, targetNodeId, {
                type: depInfo.type,
              });
            }
          }
        );
      });
    });

    return this.graph;
  }

  public findComponents(): string[][] {
    return graphlib.alg.tarjan(this.graph); //tarjan
  }

  public getModules(): Map<string, { filePath: string; name: string }[]> {
    const components = this.findComponents();
    const modules = new Map<string, { filePath: string; name: string }[]>();

    components.forEach((component) => {
      const moduleName = generateModuleName(
        component.map((c) => c.split(":")[2])
      );

      modules.set(
        moduleName,
        component.map((nodeId) => {
          const node: BlockInfo = this.graph.node(nodeId);
          let filePath = "";
          if (node) {
            const [file] = this.fileAnalyses.filter((analyse) =>
              analyse.blocks.some((block) => block.name === node.name)
            );
            filePath = file.filePath;
          }

          return {
            filePath,
            name: node?.name,
          };
        })
      );
    });

    return modules;
  }

  public getGraphInfo(): {
    nodes: number;
    edges: number;
    components: number;
    moduleInfo: Array<{
      name: string;
      blocks: number;
      files: string[];
    }>;
  } {
    const modules = this.getModules();
    const moduleInfo = Array.from(modules.entries()).map(([name, blocks]) => ({
      name,
      blocks: blocks.length,
      files: [...new Set(blocks.map((block) => block.filePath))],
    }));

    return {
      nodes: this.graph.nodes().length,
      edges: this.graph.edges().length,
      components: this.findComponents().length,
      moduleInfo,
    };
  }
}

export const createDependencyGraph = () => new DependencyGraphBuilder();
