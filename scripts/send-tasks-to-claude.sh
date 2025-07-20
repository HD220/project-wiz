#!/bin/bash

# Script para enviar tasks sequencialmente para Claude Code
# Usage: ./send-tasks-to-claude.sh [start_task] [end_task]
# Exemplo: ./send-tasks-to-claude.sh 01 05
# Exemplo: ./send-tasks-to-claude.sh 09A 12C

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório das tasks
TASKS_DIR="$(dirname "$0")/../prps/sistema-agentes-ai/tasks"

# Função para exibir ajuda
show_help() {
    echo "📋 Script para enviar tasks para Claude Code"
    echo ""
    echo "Usage:"
    echo "  $0                    # Envia todas as tasks"
    echo "  $0 [start] [end]     # Envia tasks do range especificado"
    echo ""
    echo "Exemplos:"
    echo "  $0                   # Todas as tasks"
    echo "  $0 01 05            # Tasks 01 até 05 (MVP)"
    echo "  $0 09A 12C          # Micro-tasks 09A até 12C"
    echo "  $0 10A 10C          # Apenas micro-tasks do Task 10"
    echo ""
    echo "Tasks disponíveis:"
    find "$TASKS_DIR" -name "*.md" -not -name "README.md" | sort | while read -r file; do
        basename=$(basename "$file" .md)
        title=$(grep -m1 "^# Task" "$file" 2>/dev/null | sed 's/^# Task [0-9A-C]*: //' | sed 's/ - Enhanced$//' | sed 's/ - Advanced$//' | sed 's/ - MVP$//' || echo "")
        printf "  %-8s %s\n" "$basename" "$title"
    done
}

# Função para verificar se Claude Code está disponível
check_claude() {
    if ! command -v claude &> /dev/null; then
        echo -e "${RED}❌ Claude Code não encontrado${NC}"
        echo "Instale o Claude Code CLI: https://docs.anthropic.com/en/docs/claude-code"
        exit 1
    fi
    echo -e "${GREEN}✅ Claude Code encontrado${NC}"
}

# Função para obter ordem de execução das tasks
get_task_order() {
    # Lista ordenada das tasks seguindo dependências
    cat << 'EOF'
01-basic-llm-provider-creation.md
02-list-llm-providers.md
03-basic-agent-creation.md
04-list-agents.md
05-agent-chat-interface.md
06-provider-management-enhanced.md
07-agent-configuration-enhanced.md
08-agent-memory-system-enhanced.md
09A-task-queue-foundation.md
09B-background-worker-system.md
09C-task-management-interface.md
10A-tool-foundation-registry.md
10B-git-analysis-tools.md
10C-chat-integration-interface.md
11A-project-analysis-database.md
11B-ai-candidate-generation.md
11C-hiring-interface-workflow.md
12A-collaboration-foundation-database.md
12B-agent-coordination-execution.md
12C-workflow-builder-monitoring.md
EOF
}

# Função para extrair número da task para comparação
extract_task_number() {
    local task="$1"
    # Remove prefixos e sufixos, extrai parte numérica
    echo "$task" | sed 's/^0*//' | sed 's/[A-C].*$//' | sed 's/-.*//' | head -c 2
}

# Função para verificar se task está no range
is_in_range() {
    local task="$1"
    local start="$2"
    local end="$3"
    
    if [[ -z "$start" || -z "$end" ]]; then
        return 0  # Sem range, inclui todas
    fi
    
    # Para micro-tasks (09A, 10B, etc)
    if [[ "$task" =~ ^[0-9]+[A-C] ]]; then
        # Extrai número base e letra
        local task_num=$(echo "$task" | sed 's/\([0-9]*\).*/\1/')
        local task_letter=$(echo "$task" | sed 's/[0-9]*\([A-C]\).*/\1/')
        local start_num=$(echo "$start" | sed 's/\([0-9]*\).*/\1/')
        local start_letter=$(echo "$start" | sed 's/[0-9]*\([A-C]\).*/\1/' | tr -d '\n')
        local end_num=$(echo "$end" | sed 's/\([0-9]*\).*/\1/')
        local end_letter=$(echo "$end" | sed 's/[0-9]*\([A-C]\).*/\1/' | tr -d '\n')
        
        # Se start não tem letra, assume A
        [[ -z "$start_letter" ]] && start_letter="A"
        # Se end não tem letra, assume C
        [[ -z "$end_letter" ]] && end_letter="C"
        
        # Comparação numérica primeiro
        if (( task_num > end_num )) || (( task_num < start_num )); then
            return 1
        fi
        
        # Se mesmo número, compara letras
        if (( task_num == start_num )) && [[ "$task_letter" < "$start_letter" ]]; then
            return 1
        fi
        if (( task_num == end_num )) && [[ "$task_letter" > "$end_letter" ]]; then
            return 1
        fi
        
        return 0
    fi
    
    # Para tasks normais (01, 02, etc)
    local task_num=$(extract_task_number "$task")
    local start_num=$(extract_task_number "$start")
    local end_num=$(extract_task_number "$end")
    
    if (( task_num >= start_num && task_num <= end_num )); then
        return 0
    fi
    
    return 1
}

# Função para enviar task para Claude
send_task() {
    local file="$1"
    local task_name=$(basename "$file" .md)
    
    echo -e "${BLUE}📤 Enviando Task $task_name para Claude Code...${NC}"
    
    # Lê o conteúdo do arquivo
    local content=$(cat "$file")
    
    # Cria prompt para Claude
    local prompt="Task Implementation Request:

Task File: $task_name

Please implement this task completely following the specifications. This task is part of the Sistema de Agentes AI implementation in Project Wiz.

$content

Please implement this task step by step, ensuring:
1. All database schemas are created properly
2. All service layer code is implemented with proper error handling  
3. All IPC handlers are set up correctly
4. All frontend components are created with proper TypeScript typing
5. The implementation follows the project's established patterns

Start implementation now."

    # Envia para Claude Code
    echo "$prompt" | claude --no-stream
    
    echo -e "${GREEN}✅ Task $task_name enviada com sucesso${NC}"
    echo ""
}

# Função para confirmar envio
confirm_send() {
    local count="$1"
    local start="$2"
    local end="$3"
    
    echo -e "${YELLOW}🤔 Confirmar envio?${NC}"
    if [[ -n "$start" && -n "$end" ]]; then
        echo "   Range: $start até $end"
    else
        echo "   Todas as tasks"
    fi
    echo "   Total: $count tasks"
    echo ""
    
    read -p "Continuar? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Operação cancelada${NC}"
        exit 0
    fi
}

# Função principal
main() {
    local start_task="$1"
    local end_task="$2"
    
    # Mostra ajuda se solicitado
    if [[ "$1" == "-h" || "$1" == "--help" ]]; then
        show_help
        exit 0
    fi
    
    # Verifica se Claude está disponível
    check_claude
    
    # Verifica se diretório existe
    if [[ ! -d "$TASKS_DIR" ]]; then
        echo -e "${RED}❌ Diretório de tasks não encontrado: $TASKS_DIR${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🚀 Preparando envio de tasks para Claude Code${NC}"
    echo "📁 Diretório: $TASKS_DIR"
    
    # Lista arquivos a serem enviados
    local files_to_send=()
    local count=0
    
    # Pega lista ordenada de tasks
    while IFS= read -r task_file; do
        local full_path="$TASKS_DIR/$task_file"
        
        if [[ -f "$full_path" ]]; then
            local task_name=$(basename "$task_file" .md)
            
            # Verifica se está no range especificado
            if is_in_range "$task_name" "$start_task" "$end_task"; then
                files_to_send+=("$full_path")
                ((count++))
                echo -e "  ${GREEN}✓${NC} $task_name"
            else
                echo -e "  ${YELLOW}⊘${NC} $task_name (fora do range)"
            fi
        fi
    done < <(get_task_order)
    
    if [[ $count -eq 0 ]]; then
        echo -e "${RED}❌ Nenhuma task encontrada no range especificado${NC}"
        exit 1
    fi
    
    echo ""
    
    # Confirma antes de enviar
    confirm_send "$count" "$start_task" "$end_task"
    
    echo -e "${BLUE}🚀 Iniciando envio das tasks...${NC}"
    echo ""
    
    # Envia cada task
    local sent=0
    for file in "${files_to_send[@]}"; do
        send_task "$file"
        ((sent++))
        
        # Pausa entre envios para não sobrecarregar
        if [[ $sent -lt $count ]]; then
            echo -e "${YELLOW}⏳ Aguardando 2 segundos antes da próxima task...${NC}"
            sleep 2
        fi
    done
    
    echo -e "${GREEN}🎉 Todas as tasks foram enviadas com sucesso!${NC}"
    echo "📊 Total enviado: $sent tasks"
}

# Executa função principal com argumentos
main "$@"