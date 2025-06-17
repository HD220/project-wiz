# Camadas e Componentes da Arquitetura

Este documento detalha as camadas e os principais componentes da arquitetura do sistema, seguindo os princípios da Clean Architecture.

## Domain Layer (Camada de Domínio)

**Propósito:** O Domain Layer é o coração da aplicação, contendo as regras de negócio e a lógica essencial que não depende de frameworks ou tecnologias externas. É a camada mais interna e estável da arquitetura.

**Componentes Principais:**

- **Entidades:** Representam os conceitos de negócio com estado e comportamento. Possuem identidade e ciclo de vida.
- **Value Objects:** Representam valores descritivos que não possuem identidade única. São imutáveis e definidos por seus atributos.
- **Interfaces de Repositório:** Contratos que definem como os dados do domínio podem ser persistidos e recuperados. A implementação desses contratos reside na camada de Infraestrutura.

## Application Layer (Camada de Aplicação)

**Propósito:** O Application Layer contém a lógica de aplicação que orquestra as interações entre o Domain Layer e o Infrastructure Layer. Define os casos de uso da aplicação.

**Componentes Principais:**

- **Use Cases:** Representam as ações que o usuário ou outros sistemas podem realizar na aplicação. Orquestram as entidades do domínio para executar uma tarefa específica.
- **Ports:** Interfaces que a camada de Aplicação usa para se comunicar com a camada de Infraestrutura (ex: interfaces para serviços externos, bancos de dados).
- **Serviços de Aplicação:** Coordenam a execução de múltiplos casos de uso ou interagem com serviços externos através das Ports.
- **Factories:** Responsáveis pela criação de objetos complexos, como entidades ou Value Objects, garantindo que sejam criados em um estado válido.

## Infrastructure Layer (Camada de Infraestrutura)

**Propósito:** O Infrastructure Layer lida com os detalhes técnicos e externos da aplicação, como bancos de dados, frameworks, serviços externos e interfaces de usuário. É a camada mais externa e volátil.

**Componentes Principais:**

- **Repositórios:** Implementações concretas das Interfaces de Repositório definidas no Domain Layer. Responsáveis pela comunicação com o banco de dados.
- **Adapters:** Adaptam interfaces externas (como APIs de terceiros ou sistemas de arquivos) para que possam ser utilizadas pela camada de Aplicação através das Ports.
- **Serviços de Infraestrutura:** Implementações concretas de serviços definidos nas Ports da camada de Aplicação (ex: serviço de envio de e-mail, serviço de mensageria).
- **Workers:** Processos ou threads que executam tarefas em segundo plano, muitas vezes interagindo com filas ou sistemas de mensageria.
