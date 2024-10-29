import { createQueue, createWorker } from "../services/bull";

export type AnalyseMDWorkerData = {
  filePath: string;
  commitHash: string;
  previousCommitHash?: string;
};

export const analyseMDQueue = createQueue<AnalyseMDWorkerData>("analyse-MD");
export const analyseMDWorker = createWorker<AnalyseMDWorkerData>(
  "analyse-MD",
  async (job, token) => {
    console.log(job, token);

    //ver se o arquivo filePath existe
    //se não existe: ignorar e sair (não vai ser migrado para nova versão)
    //ver se é um arquivo readme.md
    //se for pula para parte de gerar hash do trecho

    //extrai ast
    //filtra nodes não necessarios
    //gera hash do codigo

    //compara hash do codigo atual com o hash registrado no chroma para previousCommitHash
    //se for um codigo continua o trecho a baixo se não pula para a repostagem no chroma

    //cria registro json para cada node a ser analisado
    //cria arquivo jsonl com os nodes e prompts
    //envia arquivo jsonl para openai
    //move para Delayed
    //retries (1.40625m, 2.8125, 5.625m, 11.25, 22.5m, 45m, 90m, 180m, 360m, 720m, 1444m)
    //obtem retorno da openai
    //deleta arquivos (local e remoto) que foram gerados para o processo

    //salva no chromadb para nova versão (ou dados copiados da versão anterior ou novos dados)
  }
);
