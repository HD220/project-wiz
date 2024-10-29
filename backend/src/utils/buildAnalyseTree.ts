import { JobsOptions } from "bullmq";

export interface FlowJob {
  name: string;
  queueName: string;
  data?: any;
  prefix?: string;
  opts?: Omit<JobsOptions, "parent" | "repeat">;
  // children?: FlowJob[];
}

type FlowJobMap = Map<string, FlowJob & { children?: FlowJobMap }>;

export function buildAnalyseTree(
  files: {
    status: string;
    path: string;
  }[]
): FlowJob & { children?: FlowJob[] } {
  const root: FlowJobMap = new Map();

  files.forEach(({ status, path }) => {
    let currentLevel = root;

    const parts = path.split("/");
    let currentPath: string;
    parts.forEach((part) => {
      if (
        !currentLevel.has(part) &&
        !(part.endsWith(".ts") || part.endsWith(".tsx") || part.endsWith(".md"))
      ) {
        currentPath += currentPath ? `\\${part}` : `${part}`; //sem \\ na primeira atribuição
        currentLevel.set(part, {
          name: `analise-${part}`,
          queueName: `path-analysis`,
          data: {
            path: currentPath,
            status,
          },
          opts: {
            removeOnComplete: true,
            removeOnFail: true,
            ignoreDependencyOnFailure: true,
          },
          children: new Map(),
        });
      }

      currentLevel = currentLevel.get(part)!.children!;
    });
  });

  function mapToObject(
    map: Map<any, any>
  ): (FlowJob & { children?: FlowJob[] })[] {
    return Array.from(map, ([name, children]) => ({
      name,
      queueName: children ? `node` : `leaf`,
      data: {},
      opts: {},
      children,
    }));
  }

  return {
    name: "node",
    queueName: "node",
    data: {},
    opts: {},
    children: mapToObject(root),
  };
}
