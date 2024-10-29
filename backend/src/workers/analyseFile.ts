import { createQueue, createWorker } from "../services/bull";

export type AnalyseFileWorkerData = {
  status: string; // 'A' | 'M' | 'D' | 'RXXX'
  filePath: string;
  commitHash: string;
  previousCommitHash?: string;
  step?: string;
};

export const analyseFileQueue =
  createQueue<AnalyseFileWorkerData>("analyse-file");
export const analyseFileWorker = createWorker<AnalyseFileWorkerData>(
  "analyse-file",
  async (job, token) => {
    console.log(job, token);

    const [status, percent] = [
      job.data.status.slice(0, 1),
      job.data.status.slice(1),
    ];

    console.log({
      percent,
      status,
    });

    //ver se o arquivo filePath existe
    //se não existe: ignorar e sair (não vai ser migrado para nova versão)
    //ver se é um arquivo readme.md
    //se for quebra texto em partes e encaminha para analise de MD(markdown)

    //extrai ast
    //filtra nodes não necessarios
    //encaminha para analise de codigo

    //move para waitingChildrens
    //coleta resposta dos childrens
    //pega o ast do arquivo e substitui o nós pelas descrições geradas como comentario
    //gera um arquivo com o ast modificado e envia para openai gerar uma descriçao para o arquivo
  }
);
