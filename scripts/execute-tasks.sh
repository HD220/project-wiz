#!/bin/bash

# Script para executar tasks sequencialmente com Claude
# Uso: ./execute-tasks.sh <caminho-relativo-tasks>
# Exemplo: ./execute-tasks.sh ./prps/sistema-agentes-ai/tasks

set -e

# Verifica se o caminho foi fornecido
if [ $# -eq 0 ]; then
    echo "❌ Erro: Forneça o caminho relativo para as tasks"
    echo "Uso: $0 <caminho-relativo-tasks>"
    echo "Exemplo: $0 ./prps/sistema-agentes-ai/tasks"
    exit 1
fi

TASKS_PATH="$1"

# Verifica se o diretório existe
if [ ! -d "$TASKS_PATH" ]; then
    echo "❌ Erro: Diretório '$TASKS_PATH' não encontrado"
    exit 1
fi

echo "🚀 Iniciando execução sequencial de tasks em: $TASKS_PATH"
echo "⏰ Timeout configurado: 300 segundos por task"
echo "===========================================" 

# Encontra todos os arquivos .md exceto README.md, ordenados
TASK_FILES=$(find "$TASKS_PATH" -name "*.md" -not -name "README.md" | sort)

if [ -z "$TASK_FILES" ]; then
    echo "❌ Nenhum arquivo de task encontrado em '$TASKS_PATH'"
    exit 1
fi

# Conta total de tasks
TOTAL_TASKS=$(echo "$TASK_FILES" | wc -l)
CURRENT_TASK=0

echo "📋 Total de tasks encontradas: $TOTAL_TASKS"
echo "===========================================" 

# Processa cada arquivo de task
for TASK_FILE in $TASK_FILES; do
    CURRENT_TASK=$((CURRENT_TASK + 1))
    TASK_NAME=$(basename "$TASK_FILE" .md)
    
    echo ""
    echo "🔄 [$CURRENT_TASK/$TOTAL_TASKS] Executando task: $TASK_NAME"
    echo "📁 Arquivo: $TASK_FILE"
    echo "⏱️  Iniciado em: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "-------------------------------------------"
    
    # Prompt para o Claude
    PROMPT="Você deve executar COMPLETAMENTE a task descrita no arquivo '$TASK_FILE'. 

INSTRUÇÕES IMPORTANTES:
1. Leia o arquivo da task e relacionados e entenda todos os requisitos
2. Execute TODAS as partes da task - não deixe nada pela metade
3. Implemente TODA a funcionalidade solicitada
4. Execute todos os testes necessários
5. Atualize o README.md do diretório com o progresso desta task
6. A task deve estar 100% CONCLUÍDA ao final

IMPORTANTE: Esta é uma execução automatizada. Complete a task integralmente."

    # Executa Claude com timeout e captura a saída
    echo "🤖 Enviando task para Claude..."
    
    if claude --dangerously-skip-permissions -p "$PROMPT" 2>&1; then
        echo ""
        echo "✅ Task '$TASK_NAME' executada com sucesso!"
        echo "⏱️  Finalizada em: $(date '+%Y-%m-%d %H:%M:%S')"
    else
        EXIT_CODE=$?
        echo ""
		echo "❌ ERRO: Task '$TASK_NAME' falhou (código: $EXIT_CODE)"
        echo "⏱️  Finalizada em: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    echo "==========================================="
    
    # Pausa entre tasks para evitar sobrecarga
    if [ $CURRENT_TASK -lt $TOTAL_TASKS ]; then
        echo "⏸️  Pausando 2 segundos antes da próxima task..."
        sleep 2
    fi
done

echo ""
echo "🎉 EXECUÇÃO COMPLETA!"
echo "📊 Total de tasks processadas: $TOTAL_TASKS"
echo "⏱️  Finalizado em: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==========================================="