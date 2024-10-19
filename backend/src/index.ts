import { ConnectionOptions, Queue } from "bullmq";
import { Worker } from "bullmq";

const connection: ConnectionOptions = {
    host: "localhost",
    port: 6379,
  };

function start(){
    //INICIALIZAÇÃO
      //obter a lista de repositorios cadastrados (configuração redis)
      //obter a lista de aplicativos instalados (github)
      
      //verificar para cada repositório cadastrado se tem uma instalação com mesmo owner e repositorio
        //se tiver, verifica se já deu inicio ao processo do repositório
          //se não, inicia o processo do repositorio 
        //se não tiver, remove a configuração do repositório do redis
      
      //verifica as instalações restantes que não tem configuração do owner
        //usa data da instalação, se passado x tempo remove a instalação do github

    //webhooks github (nextjs) inicializa jobs no worker
      //installation e installation_repositories
        //faz mesmo processo que ocorre na inicialização, mas aqui é feito espefico para os dados do evento.
      //push
        //identifica se o branch default teve alterações para atualizar o clone do repositorio
        //esse processo talvez requeira que os workers finalizem o seu processamento do repositório antes de ser realizado
      //issues
        //identifica criação de issues para o bot de resolução iniciando ou parando as worker de resolução
      //pull_request
        //serve apenas para consolidar quantos pull_requests dos workers foram aceitos ou negados
}



const worker = new Worker(
  "foo",
  async (job) => {
    console.log(job.data);
  },
  { connection }
);

const myQueue = new Queue("foo", { connection });

async function addJobs() {
  await myQueue.add("myJobName", { foo: "bar" });
  await myQueue.add("myJobName", { qux: "baz" });
}

addJobs();
