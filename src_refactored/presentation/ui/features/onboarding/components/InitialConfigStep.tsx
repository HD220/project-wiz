import React from 'react';

// import { LLMConfigForm } from '@/presentation/ui/features/llm/components/LLMConfigForm';

export function InitialConfigStep() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Configuração Inicial Essencial</h3>
      <p className="text-slate-700 dark:text-slate-300 mb-4">
        Para que os Agentes IA do Project Wiz funcionem, eles precisam de acesso a um
        Provedor de Modelo de Linguagem (LLM). Por favor, configure seu primeiro provedor.
      </p>
      {/*
        Quando LLMConfigForm estiver pronto e funcional, ele será integrado aqui.
        Por agora, um placeholder:
      */}
      <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-md">
        <p className="text-center text-slate-500 dark:text-slate-400">
          (Placeholder para o Formulário de Configuração de LLM)
        </p>
        <p className="mt-2 text-xs text-center text-slate-400 dark:text-slate-500">
          Você poderá adicionar um nome para esta configuração, selecionar o provedor (ex: OpenAI, DeepSeek),
          e inserir sua Chave de API.
        </p>
      </div>
       <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        Você poderá adicionar mais provedores ou modificar esta configuração posteriormente
        na seção de "Configurações" da aplicação.
      </p>
    </div>
  );
}
