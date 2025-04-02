export interface ModelListProps {
  /**
   * Array de modelos a serem exibidos
   */
  models: Array<{
    metadata: {
      id: string;
      name: string;
      modelId: string;
      size: string;
      description: string;
    };
    state: {
      status: "downloaded" | "not-downloaded";
      lastUsed: string | null;
      isActive: boolean;
    };
  }>;

  /**
   * Callback chamado quando um modelo é ativado
   */
  onActivate?: (modelId: string) => void;

  /**
   * Estado de carregamento
   */
  isLoading?: boolean;

  /**
   * Mensagem para quando não há modelos
   */
  emptyMessage?: string;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

export interface ModelItemProps {
  model: {
    metadata: {
      id: string;
      name: string;
      modelId: string;
      size: string;
      description: string;
    };
    state: {
      status: "downloaded" | "not-downloaded";
      lastUsed: string | null;
      isActive: boolean;
    };
  };
  onActivate?: (modelId: string) => void;
}
