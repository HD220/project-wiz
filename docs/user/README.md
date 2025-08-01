# Guia do Usu�rio - Project Wiz

Bem-vindo ao Project Wiz! Este guia ajudar� voc� a come�ar a usar nossa plataforma de automa��o de desenvolvimento de software powered by AI.

## <� O que � o Project Wiz?

O Project Wiz � uma **f�brica de software aut�noma** que funciona como uma equipe de desenvolvimento de IA. Em vez de programar diretamente, voc� trabalha como um **gerente de projeto**, delegando tarefas para agentes especializados que executam o trabalho de codifica��o para voc�.

### Como Funciona?

- **Voc� � o gerente**, os **agentes de IA s�o sua equipe**
- **Interface estilo Discord/Slack** para comunica��o natural
- **Conversas em linguagem natural** em vez de comandos t�cnicos
- **Automa��o completa** do ciclo de desenvolvimento

## =� Primeiros Passos

### 1. Instala��o e Configura��o

1. **Baixe o Project Wiz** para seu sistema operacional
2. **Execute o instalador** e siga as instru��es
3. **Configure suas chaves de API** dos provedores de IA (OpenAI, Anthropic, etc.)
4. **Crie seu primeiro projeto**

### 2. Conceitos B�sicos

#### **Projetos = Servidores**

- Cada projeto � como um "servidor" no Discord
- Cont�m toda a base de c�digo e contexto do projeto
- Pode ser criado do zero ou importado de um reposit�rio existente

#### **Canais = Conversas**

- Dentro de cada projeto, voc� tem canais de texto
- Use para diferentes tipos de discuss�o (desenvolvimento, bugs, ideias)
- Canal "geral" � criado automaticamente

#### **Agentes = Sua Equipe**

- Especialistas de IA contratados para seu projeto
- Cada um tem habilidades espec�ficas (Frontend, Backend, QA, DevOps)
- Trabalham de forma aut�noma em segundo plano

## =� Como Usar a Interface

### Navega��o Principal

```
                 ,                                
                                                 
  SIDEBAR                 �REA PRINCIPAL         
                                                 
  =� DMs           =� Chat do Projeto/Canal     
  =� Projetos      =� Conversas com Agentes     
      Projeto A   =� Painel de Atividades      
      Projeto B   � Configura��es             
                                                 
                 4                                
```

### Mensagens Diretas (DMs)

- **�rea pessoal** para conversas fora do contexto de projetos
- **Configura��es globais** como chaves de API e prefer�ncias
- **Assistente geral** para ajuda e orienta��es

### Projetos

- **Criar novo projeto** ou importar reposit�rio existente
- **Navegar entre canais** do projeto
- **Ver atividade** e progresso dos agentes
- **Gerenciar equipe** de agentes contratados

## > Trabalhando com Agentes

### Contratando Agentes

**Contrata��o Autom�tica:**

- O sistema analisa seu projeto
- Sugere e contrata agentes relevantes automaticamente
- Notifica voc� sobre novos "membros da equipe"

**Contrata��o Manual:**

- Acesse "Gerenciar Equipe" no projeto
- Escolha especialidades necess�rias:
  - **Frontend Developer** - React, UI/UX, componentes
  - **Backend Developer** - APIs, banco de dados, l�gica de neg�cio
  - **QA Engineer** - Testes, qualidade, debugging
  - **DevOps Engineer** - Deploy, CI/CD, infraestrutura

### Delegando Tarefas

Simplesmente **converse naturalmente** com sua equipe:

```
Voc�: "Pessoal, precisamos implementar autentica��o por dois fatores"

Sistema:  Tarefa criada e atribu�da ao Backend Developer
         =� Estimativa: 2-3 horas
         =d Respons�vel: Alex (Backend)

Alex: "Entendi! Vou implementar 2FA usando TOTP.
       Criarei as rotas de API e tabelas de banco necess�rias."
```

### Tipos de Solicita��es

- **Novas funcionalidades:** "Adicione um sistema de notifica��es"
- **Corre��es:** "O login est� falhando para alguns usu�rios"
- **Melhorias:** "Otimize a performance da p�gina de dashboard"
- **Investiga��es:** "Por que os testes est�o demorando tanto?"

## =� Acompanhando o Progresso

### Painel de Atividades

- **Jobs em Execu��o** - Tarefas sendo trabalhadas agora
- **Jobs na Fila** - Pr�ximas tarefas a serem executadas
- **Jobs Conclu�dos** - Hist�rico de trabalho realizado
- **Commits Recentes** - Mudan�as de c�digo feitas pelos agentes

### Notifica��es

- **Tarefas conclu�das** - Quando um agente termina um trabalho
- **Problemas encontrados** - Quando um agente precisa de ajuda
- **Novos agentes** - Quando o sistema contrata especialistas

## =' Configura��es e Personaliza��o

### Configura��es do Projeto

- **Contrata��o autom�tica** - Habilitar/desabilitar
- **Prefer�ncias de commit** - Frequ�ncia e formato
- **Integra��es** - Conectar servi�os externos
- **Controle de acesso** - Permiss�es de agentes

### Configura��es Globais

- **Provedores de IA** - Configurar OpenAI, Anthropic, etc.
- **Tema** - Claro, escuro, autom�tico
- **Notifica��es** - Quais eventos voc� quer ser notificado
- **Backup** - Configura��es de sincroniza��o

## S Perguntas Frequentes

### **"Como fa�o para..."**

**Q: Como fa�o para corrigir um bug?**
A: Simplesmente descreva o problema no chat: "Existe um bug na p�gina de login onde..."

**Q: Como adiciono uma nova funcionalidade?**
A: Converse naturalmente: "Quero adicionar um sistema de coment�rios ao blog"

**Q: Como sei se os agentes est�o trabalhando?**
A: Verifique o painel de atividades e as notifica��es em tempo real

**Q: Posso controlar que tipo de agente trabalha no meu projeto?**
A: Sim! Gerencie sua equipe nas configura��es do projeto

**Q: E se eu n�o gostar do que um agente fez?**
A: D� feedback direto: "Alex, essa implementa��o n�o est� como eu queria..."

### **Solu��o de Problemas**

- **Agentes n�o respondem:** Verifique se suas chaves de API est�o configuradas
- **Projeto n�o carrega:** Verifique se o reposit�rio tem as permiss�es corretas
- **Performance lenta:** Reduza o n�mero de agentes ativos simultaneamente

## 🔗 Documentação Relacionada

### 📚 **Próximos Passos Essenciais**

- **[🚀 Como Começar](./getting-started.md)** - Tutorial passo a passo completo **(15 min)**
- **[🔄 Fluxos de Usuário](./user-flows.md)** - Cenários comuns de uso **(10 min)**
- **[❓ FAQ Completo](./faq.md)** - Perguntas e respostas detalhadas **(browse conforme necessário)**

### 🛠️ **Para Desenvolvedores**

- **[📖 Developer Guide](../developer/README.md)** - Se você quiser contribuir com código
- **[🏗️ Technical Guides](../technical-guides/)** - Implementações técnicas avançadas
- **[📋 Planning Docs](../planning/)** - Visão de produto e roadmap

### 🔙 **Navegação**

- **[← Voltar à Documentação Principal](../README.md)**
- **[📖 Documentação para Desenvolvedores](../developer/README.md)**
- **[📋 Planejamento & Estratégia](../planning/README.md)**

---

## 🎯 Caminho de Aprendizado para Usuários

### **Fase 1: Primeiros Passos** _(~25 min)_

1. **Comece aqui** - Este Guia do Usuário (visão geral)
2. **[🚀 Getting Started](./getting-started.md)** - Setup e primeiro projeto
3. **Crie seu primeiro projeto** - Prática hands-on

### **Fase 2: Domínio da Plataforma** _(~20 min)_

4. **[🔄 User Flows](./user-flows.md)** - Cenários avançados de uso
5. **Experimente** - Teste diferentes tipos de agentes e projetos
6. **[❓ FAQ](./faq.md)** - Consulte quando tiver dúvidas específicas

### **Fase 3: Maestria** _(ongoing)_

7. **Otimize** - Refine seu workflow baseado na experiência
8. **Contribua** - Compartilhe feedback para melhorar a plataforma
9. **Explore recursos avançados** - Integrações e configurações customizadas

**🎯 Critério de Sucesso:** Consegue criar projetos, contratar agentes especializados, delegar tarefas complexas e acompanhar progresso autonomamente

---

## 💡 Dicas de Sucesso

### **📝 Comunicação Efetiva**

- **Seja específico** nas suas solicitações - quanto mais contexto, melhor
- **Dê feedback** aos agentes para que eles aprendam suas preferências
- **Use linguagem natural** - não precisa ser técnico

### **👥 Gestão de Equipe**

- **Monitore o progresso** mas confie na autonomia dos agentes
- **Experimente** com diferentes tipos de agentes para diferentes necessidades
- **Use canais específicos** para diferentes tipos de discussão

### **🚀 Produtividade**

- **Estabeleça fluxos de trabalho** consistentes
- **Aproveite templates** para tarefas recorrentes
- **Configure notificações** para manter-se informado sem ser interrompido

Pronto para começar? Vá para o **[🚀 Guia de Introdução](./getting-started.md)**! 🎯
