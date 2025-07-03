type DocFile = { type: "file"; content: string; nameOverride?: string };
type DocFolder = {
  type: "folder";
  children: Record<string, DocEntry>;
  nameOverride?: string;
};
type DocEntry = DocFile | DocFolder;

const mockDocsFileSystem = {
  readmeMd: {
    type: "file",
    content: "# Documentação do Projeto X\n\nBem-vindo à documentação oficial do Projeto X. Este documento serve como ponto de partida para entender a arquitetura, configuração e funcionalidades chave.\n\n## Seções Principais\n- Arquitetura do Sistema\n- Guia de Instalação\n- Casos de Uso\n\n### Exemplo de Código\n```typescript\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n```\n",
  },
  arquiteturaDir: {
    type: "folder",
    nameOverride: "arquitetura/",
    children: {
      visaoGeralMd: {
        nameOverride: "visao-geral.md",
        type: "file",
        content: "## Visão Geral da Arquitetura\n\nO sistema é modular...",
      },
      componentesMd: {
        nameOverride: "componentes.md",
        type: "file",
        content: "### Componentes Principais\n\n- Módulo A\n- Módulo B",
      },
    },
  },
  guiasDir: {
    type: "folder",
    nameOverride: "guias/",
    children: {
      instalacaoMd: {
        nameOverride: "instalacao.md",
        type: "file",
        content: "## Guia de Instalação\n\nSiga os passos...",
      },
    },
  },
};

export { mockDocsFileSystem, DocFile, DocFolder, DocEntry };
