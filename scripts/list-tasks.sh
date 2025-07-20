#!/bin/bash

# Script para listar e visualizar tasks disponíveis
# Usage: ./list-tasks.sh [options]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Diretório das tasks
TASKS_DIR="$(dirname "$0")/../prps/sistema-agentes-ai/tasks"

# Função para exibir ajuda
show_help() {
    echo "📋 Lista e visualiza tasks do Sistema de Agentes AI"
    echo ""
    echo "Usage:"
    echo "  $0                     # Lista todas as tasks"
    echo "  $0 --summary          # Resumo com status"
    echo "  $0 --mvp              # Apenas tasks MVP (01-05)"
    echo "  $0 --enhanced         # Apenas tasks Enhanced (06-09)"
    echo "  $0 --advanced         # Apenas tasks Advanced (10-12)"
    echo "  $0 --micro            # Apenas micro-tasks (09A-12C)"
    echo "  $0 --view [task]      # Visualiza conteúdo de uma task específica"
    echo ""
    echo "Exemplos:"
    echo "  $0 --view 01          # Mostra conteúdo da Task 01"
    echo "  $0 --view 09A         # Mostra conteúdo da Task 09A"
    echo "  $0 --mvp             # Lista apenas tasks MVP"
}

# Função para obter fase da task
get_phase() {
    local task="$1"
    local num=$(echo "$task" | sed 's/[^0-9]//g' | head -c 2)
    
    if [[ "$num" =~ ^0[1-5]$ ]]; then
        echo "MVP"
    elif [[ "$num" =~ ^0[6-9]$ ]]; then
        echo "Enhanced"
    elif [[ "$num" =~ ^1[0-2]$ ]]; then
        echo "Advanced"
    else
        echo "Unknown"
    fi
}

# Função para obter emoji da fase
get_phase_emoji() {
    case "$1" in
        "MVP") echo "🚀" ;;
        "Enhanced") echo "⚡" ;;
        "Advanced") echo "🔬" ;;
        *) echo "❓" ;;
    esac
}

# Função para obter cor da fase
get_phase_color() {
    case "$1" in
        "MVP") echo "$GREEN" ;;
        "Enhanced") echo "$YELLOW" ;;
        "Advanced") echo "$PURPLE" ;;
        *) echo "$NC" ;;
    esac
}

# Função para extrair título da task
get_task_title() {
    local file="$1"
    if [[ -f "$file" ]]; then
        grep -m1 "^# Task" "$file" 2>/dev/null | sed 's/^# Task [0-9A-C]*: //' | sed 's/ - Enhanced$//' | sed 's/ - Advanced$//' | sed 's/ - MVP$//' || echo "Sem título"
    else
        echo "Arquivo não encontrado"
    fi
}

# Função para obter estimativa de tempo
get_time_estimate() {
    local task="$1"
    
    # Micro-tasks têm estimativas específicas
    if [[ "$task" =~ ^[0-9]+[A-C] ]]; then
        case "$task" in
            09A|09B|09C|10A|11A|12A) echo "1.5h" ;;
            10B|10C|11B|11C) echo "2h" ;;
            12B|12C) echo "2.5h" ;;
            *) echo "2h" ;;
        esac
    else
        # Tasks principais
        case "$task" in
            01) echo "2h" ;;
            02) echo "1.5h" ;;
            03) echo "3h" ;;
            04) echo "2h" ;;
            05) echo "4h" ;;
            06) echo "3h" ;;
            07) echo "2.5h" ;;
            08) echo "3.5h" ;;
            *) echo "3h" ;;
        esac
    fi
}

# Função para listar todas as tasks
list_all_tasks() {
    local filter="$1"
    
    echo -e "${BLUE}📋 Tasks do Sistema de Agentes AI${NC}"
    echo ""
    
    # Cabeçalho da tabela
    printf "%-8s %-8s %-8s %-50s %-8s\n" "Task" "Phase" "Time" "Title" "Status"
    printf "%-8s %-8s %-8s %-50s %-8s\n" "----" "-----" "----" "-----" "------"
    
    # Lista arquivos ordenados
    find "$TASKS_DIR" -name "*.md" -not -name "README.md" | sort | while read -r file; do
        local basename=$(basename "$file" .md)
        local task_num=$(echo "$basename" | sed 's/-.*//')
        local phase=$(get_phase "$task_num")
        local emoji=$(get_phase_emoji "$phase")
        local color=$(get_phase_color "$phase")
        local title=$(get_task_title "$file")
        local time=$(get_time_estimate "$task_num")
        
        # Aplica filtro se especificado
        case "$filter" in
            "mvp") [[ "$phase" != "MVP" ]] && continue ;;
            "enhanced") [[ "$phase" != "Enhanced" ]] && continue ;;
            "advanced") [[ "$phase" != "Advanced" ]] && continue ;;
            "micro") [[ ! "$task_num" =~ [A-C]$ ]] && continue ;;
        esac
        
        # Trunca título se muito longo
        if [[ ${#title} -gt 47 ]]; then
            title="${title:0:44}..."
        fi
        
        printf "${color}%-8s${NC} ${emoji}%-7s %-8s %-50s ${GREEN}✅ Ready${NC}\n" \
            "$task_num" "$phase" "$time" "$title"
    done
}

# Função para mostrar resumo
show_summary() {
    echo -e "${BLUE}📊 Resumo das Tasks${NC}"
    echo ""
    
    local total=0
    local mvp_count=0
    local enhanced_count=0
    local advanced_count=0
    local micro_count=0
    local total_hours=0
    
    find "$TASKS_DIR" -name "*.md" -not -name "README.md" | while read -r file; do
        local basename=$(basename "$file" .md)
        local task_num=$(echo "$basename" | sed 's/-.*//')
        local phase=$(get_phase "$task_num")
        local time=$(get_time_estimate "$task_num")
        local hours=$(echo "$time" | sed 's/h//')
        
        ((total++))
        total_hours=$(echo "$total_hours + $hours" | bc -l)
        
        case "$phase" in
            "MVP") ((mvp_count++)) ;;
            "Enhanced") ((enhanced_count++)) ;;
            "Advanced") ((advanced_count++)) ;;
        esac
        
        if [[ "$task_num" =~ [A-C]$ ]]; then
            ((micro_count++))
        fi
    done
    
    echo -e "${GREEN}🚀 MVP Phase:${NC} $mvp_count tasks (Tasks 01-05)"
    echo -e "${YELLOW}⚡ Enhanced Phase:${NC} $enhanced_count tasks (Tasks 06-09 + micro-tasks)"
    echo -e "${PURPLE}🔬 Advanced Phase:${NC} $advanced_count tasks (Tasks 10-12 + micro-tasks)"
    echo ""
    echo -e "${CYAN}📦 Micro-tasks:${NC} $micro_count tasks (subdivided from complex tasks)"
    echo -e "${BLUE}📊 Total:${NC} $total tasks"
    echo -e "${BLUE}⏱️  Estimated Total Time:${NC} ${total_hours}h"
}

# Função para visualizar uma task específica
view_task() {
    local task_id="$1"
    
    if [[ -z "$task_id" ]]; then
        echo -e "${RED}❌ Especifique o ID da task${NC}"
        echo "Exemplo: $0 --view 01"
        exit 1
    fi
    
    # Procura o arquivo da task
    local task_file=$(find "$TASKS_DIR" -name "${task_id}-*.md" | head -1)
    
    if [[ -z "$task_file" || ! -f "$task_file" ]]; then
        echo -e "${RED}❌ Task '$task_id' não encontrada${NC}"
        echo ""
        echo "Tasks disponíveis:"
        find "$TASKS_DIR" -name "*.md" -not -name "README.md" | sort | while read -r file; do
            local basename=$(basename "$file" .md)
            local task_num=$(echo "$basename" | sed 's/-.*//')
            echo "  $task_num"
        done
        exit 1
    fi
    
    local task_num=$(basename "$task_file" .md | sed 's/-.*//')
    local title=$(get_task_title "$task_file")
    local phase=$(get_phase "$task_num")
    local emoji=$(get_phase_emoji "$phase")
    local time=$(get_time_estimate "$task_num")
    
    echo -e "${BLUE}📋 Task $task_num - $title${NC}"
    echo -e "${CYAN}Phase:${NC} $emoji $phase"
    echo -e "${CYAN}Estimated Time:${NC} $time"
    echo -e "${CYAN}File:${NC} $(basename "$task_file")"
    echo ""
    echo -e "${YELLOW}--- Conteúdo ---${NC}"
    echo ""
    
    # Mostra o conteúdo com syntax highlighting se disponível
    if command -v bat &> /dev/null; then
        bat --style=header,grid --language=markdown "$task_file"
    elif command -v highlight &> /dev/null; then
        highlight -O ansi --syntax=markdown "$task_file"
    else
        cat "$task_file"
    fi
}

# Função principal
main() {
    local action="$1"
    local param="$2"
    
    # Verifica se diretório existe
    if [[ ! -d "$TASKS_DIR" ]]; then
        echo -e "${RED}❌ Diretório de tasks não encontrado: $TASKS_DIR${NC}"
        exit 1
    fi
    
    case "$action" in
        "-h"|"--help")
            show_help
            ;;
        "--summary")
            show_summary
            ;;
        "--mvp")
            list_all_tasks "mvp"
            ;;
        "--enhanced")
            list_all_tasks "enhanced"
            ;;
        "--advanced")
            list_all_tasks "advanced"
            ;;
        "--micro")
            list_all_tasks "micro"
            ;;
        "--view")
            view_task "$param"
            ;;
        "")
            list_all_tasks
            ;;
        *)
            echo -e "${RED}❌ Opção inválida: $action${NC}"
            echo "Use $0 --help para ver as opções disponíveis"
            exit 1
            ;;
    esac
}

# Executa função principal
main "$@"