import { createQueue, createWorker } from "../services/bull";

export type GenerateGraphWorkerData = {
  test: string;
};

export const generateGraphQueue =
  createQueue<GenerateGraphWorkerData>("generate-graph");
export const generateGraphWorker = createWorker<GenerateGraphWorkerData>(
  "generate-graph",
  async (job, token) => {
    console.log(job, token);

    // tsFiles.forEach(async ({filePath})=>{
    //   const fileName = path.basename(filePath)
    //   const code = readFileSync(path.resolve(workingDirectory, './', filePath)).toString('utf-8')
    //   const ast = parse(code,{
    //     parser: await import('recast/parsers/typescript')
    //   })
    //   visit(ast,{

    //   })
    // })
  }
);
