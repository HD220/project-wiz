#!/bin/bash

# MVP Development Shell - Sistema Colaborativo Multi-Agente
# Simula uma equipe completa de desenvolvimento até conclusão do MVP

set -euo pipefail

# --- Configurações Globais ---
LLM_COMMAND="${LLM_COMMAND:-claude}"
LOG_LEVEL="${LOG_LEVEL:-INFO}"
declare -i MAX_ITERATIONS="${MAX_ITERATIONS:-50}"
AUTO_EXTEND="${AUTO_EXTEND:-true}"  # Extensão automática se há progresso
CURRENT_ITERATION=0

# Diretórios de trabalho
WORK_DIR="${PWD}/mvp_workspace"
MVP_DESCRIPTION_FILE="${PWD}/mvp_description.md" # Default MVP description file (expected in current working directory)
LOG_DIR="${WORK_DIR}/logs"
DOCS_DIR="${WORK_DIR}/docs"
CODE_DIR="${WORK_DIR}/code"
TESTS_DIR="${WORK_DIR}/tests"
REVIEWS_DIR="${WORK_DIR}/reviews"

SESSION_ID="mvp_$(date +%Y%m%d_%H%M%S)"
MAIN_LOG="${LOG_DIR}/mvp_${SESSION_ID}.log"

# Estado do MVP
MVP_STATUS="PLANNING"  # PLANNING -> DEVELOPING -> TESTING -> REVIEWING -> COMPLETED -> FAILED
ACCEPTANCE_CRITERIA=""
CURRENT_TASKS=()
COMPLETED_TASKS=()
FAILED_TASKS=()

# --- Cores para Output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# --- Sistema de Logging ---
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local formatted="[$timestamp] [$level] $message"
    
    # Garante que o diretório existe antes de escrever
    mkdir -p "$(dirname "$MAIN_LOG")" 2>/dev/null || true
    echo "$formatted" >> "$MAIN_LOG"
    
    case "$level" in
        "ERROR")    echo -e "${RED}[ERROR]${NC} $message" ;;
        "SUCCESS")  echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        "WARN")     echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "INFO")     echo -e "${BLUE}[INFO]${NC} $message" ;;
        "AGENT")    echo -e "${PURPLE}[AGENT]${NC} $message" ;;
        "MVP")      echo -e "${CYAN}[MVP]${NC} $message" ;;
        *)          echo "$message" ;;
    esac
}

# --- Funções de Utilitário ---
create_workspace() {
    log "INFO" "Criando workspace para desenvolvimento do MVP..."
    mkdir -p "$WORK_DIR" "$LOG_DIR" "$DOCS_DIR" "$CODE_DIR" "$TESTS_DIR" "$REVIEWS_DIR"
    
    # Cria arquivo de estado
    cat > "$WORK_DIR/mvp_state.json" << EOF
{
    "session_id": "$SESSION_ID",
    "status": "$MVP_STATUS",
    "iteration": $CURRENT_ITERATION,
    "created": "$(date -Iseconds)",
    "tasks": {
        "current": [],
        "completed": [],
        "failed": []
    }
}
EOF
    
    log "SUCCESS" "Workspace criado em: $WORK_DIR"
}

# Função para extrair e salvar blocos de código de uma resposta markdown
extract_and_save_code_blocks() {
    local response_content="$1"
    local output_dir="$2"
    local saved_files=""
    local in_code_block=false
    local current_filename=""
    local current_code=""
    local file_count=0

    # Ensure output directory exists
    mkdir -p "$output_dir"

    # Read the response line by line
    while IFS= read -r line; do
        if [[ "$line" =~ ^###[[:space:]]*Arquivo:[[:space:]]*(.+)$ ]]; then
            # New file block starts, save previous if any
            if [ "$in_code_block" = true ]; then
                if [ -n "$current_filename" ] && [ -n "$current_code" ]; then
                    local full_path="${output_dir}/${current_filename}"
                    echo "$current_code" > "$full_path"
                    log "INFO" "Código salvo em: $full_path"
                    saved_files+="$full_path "
                    file_count=$((file_count + 1))
                fi
            fi
            current_filename="${BASH_REMATCH[1]}"
            current_code=""
            in_code_block=false
        elif [[ "$line" =~ ^\`\`\`([a-zA-Z0-9]+)? ]]; then
            if [ "$in_code_block" = true ]; then
                # End of a code block, save it
                if [ -n "$current_filename" ] && [ -n "$current_code" ]; then
                    local full_path="${output_dir}/${current_filename}"
                    echo "$current_code" > "$full_path"
                    log "INFO" "Código salvo em: $full_path"
                    saved_files+="$full_path "
                    file_count=$((file_count + 1))
                fi
                in_code_block=false
                current_code="" # Reset code after saving
            else
                # Start of a code block
                in_code_block=true
                current_code="" # Clear previous code
            fi
        elif [ "$in_code_block" = true ]; then
            current_code+="$line\n"
        fi
    done <<< "$response_content"

    # Save any remaining code block after the loop
    if [ "$in_code_block" = true ]; then
        if [ -n "$current_filename" ] && [ -n "$current_code" ]; then
            local full_path="${output_dir}/${current_filename}"
            echo "$current_code" > "$full_path"
            log "INFO" "Código salvo em: $full_path"
            saved_files+="$full_path "
            file_count=$((file_count + 1))
        fi
    fi
    
    if [ "$file_count" -eq 0 ]; then
        log "WARN" "Nenhum bloco de código encontrado ou salvo na resposta do agente."
    fi

    echo "$saved_files"
}

execute_agent() {
    local agent_role="$1"
    local prompt="$2"
    local context_file="${3:-}"
    
    log "AGENT" "Executando agente: $agent_role"
    
    local full_prompt="PAPEL: Você é um $agent_role especializado.
CONTEXTO: Desenvolvimento de MVP colaborativo.
ITERAÇÃO: $CURRENT_ITERATION/$MAX_ITERATIONS
STATUS ATUAL: $MVP_STATUS

$prompt

INSTRUÇÕES:
- Seja específico e prático
- Considere limitações de tempo/recursos
- Forneça deliverables concretos
- Mantenha foco no MVP (mínimo viável)"

    if [[ -n "$context_file" && -f "$context_file" ]]; then
        full_prompt="$full_prompt

CONTEXTO ADICIONAL:
$(cat "$context_file")"
    fi

    log "INFO" "Prompt completo para $agent_role:
$full_prompt"

    local response=""
    case "$LLM_COMMAND" in
        "claude")
            if ! response=$(echo "$full_prompt" | claude -p --dangerously-skip-permissions 2>&1); then
                log "ERROR" "Falha na execução do agente $agent_role"
                return 1
            fi
            ;;
        "gemini")
            if ! response=$(echo "$full_prompt" | gemini --yolo --model=gemini-2.5-flash 2>&1); then
                log "ERROR" "Falha na execução do agente $agent_role"
                return 1
            fi
            ;;
        *)
            log "ERROR" "Comando LLM não suportado: $LLM_COMMAND"
            return 1
            ;;
    esac

    # Salva resposta do agente
    local agent_log="$LOG_DIR/agent_${agent_role,,}_iter${CURRENT_ITERATION}.md"
    echo "# $agent_role - Iteração $CURRENT_ITERATION" > "$agent_log"
    echo "**Data:** $(date)" >> "$agent_log"
    echo "**Status MVP:** $MVP_STATUS" >> "$agent_log"
    echo "" >> "$agent_log"
    echo "$response" >> "$agent_log"
    
    log "SUCCESS" "Agente $agent_role concluído. Log: $agent_log"
    echo "$response"
}

# --- Agentes Especializados ---

product_manager_agent() {
    local mvp_description="$1"
    
    log "MVP" "🎯 Product Manager analisando requisitos..."
    
    local pm_prompt="Como Product Manager, analise esta descrição de MVP e defina:

DESCRIÇÃO DO MVP:
$mvp_description

DELIVERABLES OBRIGATÓRIOS:
1. ESCOPO DEFINIDO: O que entra e o que NÃO entra no MVP
2. CRITÉRIOS DE ACEITE: Lista clara e testável (formato: DADO... QUANDO... ENTÃO...)
3. FUNCIONALIDADES CORE: 3-5 funcionalidades essenciais
4. DEFINIÇÃO DE PRONTO: Quando considerar o MVP concluído
5. RISCOS IDENTIFICADOS: Principais riscos técnicos/negócio

Formato de resposta:
## ESCOPO DO MVP
[escopo detalhado]

## CRITÉRIOS DE ACEITE
- [ ] CA1: DADO [contexto] QUANDO [ação] ENTÃO [resultado esperado]
- [ ] CA2: ...

## FUNCIONALIDADES CORE
1. [funcionalidade 1]
2. [funcionalidade 2]

## DEFINIÇÃO DE PRONTO
[critérios claros]

## RISCOS IDENTIFICADOS
- [risco 1]
- [risco 2]"

    local pm_response=$(execute_agent "Product Manager" "$pm_prompt")
    
    # Extrai critérios de aceite
    ACCEPTANCE_CRITERIA=$(echo "$pm_response" | sed -n '/## CRITÉRIOS DE ACEITE/,/## /p' | head -n -1)
    
    # Salva documentação
    echo "$pm_response" > "$DOCS_DIR/product_requirements.md"
    
    log "SUCCESS" "📋 Requisitos definidos pelo Product Manager"
    echo "$pm_response"
}

architect_agent() {
    local requirements_file="$DOCS_DIR/product_requirements.md"
    
    log "MVP" "🏗️ Arquiteto técnico planejando solução..."
    
    local arch_prompt="Como Arquiteto de Software, crie um plano técnico para este MVP:

TAREFAS:
1. ARQUITETURA: Defina arquitetura mínima mas escalável
2. STACK TECNOLÓGICO: Escolha tecnologias adequadas
3. ESTRUTURA DE CÓDIGO: Organize pastas e módulos
4. PLANO DE IMPLEMENTAÇÃO: Quebre em tarefas específicas
5. ESTRATÉGIA DE TESTES: Como validar cada componente

Formato de resposta:
## ARQUITETURA
[desenho da arquitetura]

## STACK TECNOLÓGICO
- Backend: [tecnologia]
- Frontend: [tecnologia]
- Banco: [tecnologia]
- Deploy: [tecnologia]

## ESTRUTURA DO CÓDIGO
\`\`\`
projeto/
├── src/
│   ├── backend/
│   ├── frontend/
│   └── shared/
├── tests/
└── docs/
\`\`\`

## TAREFAS DE IMPLEMENTAÇÃO
1. [SETUP] [descrição detalhada]
2. [BACKEND] [descrição detalhada]
3. [FRONTEND] [descrição detalhada]
4. [INTEGRAÇÃO] [descrição detalhada]
5. [TESTES] [descrição detalhada]

## ESTRATÉGIA DE TESTES
[como testar cada componente]"

    local arch_response=$(execute_agent "Arquiteto Técnico" "$arch_prompt" "$requirements_file")
    
    # Extrai e processa tarefas
    local tasks_section=$(echo "$arch_response" | sed -n '/## TAREFAS DE IMPLEMENTAÇÃO/,/## /p' | head -n -1)
    
    # Converte tarefas em array
    while IFS= read -r line; do
        if [[ "$line" =~ ^[0-9]+\. ]]; then
            CURRENT_TASKS+=("$line")
        fi
    done <<< "$tasks_section"
    
    echo "$arch_response" > "$DOCS_DIR/technical_architecture.md"
    
    log "SUCCESS" "🎯 Arquitetura definida. ${#CURRENT_TASKS[@]} tarefas identificadas"
    echo "$arch_response"
}

developer_agent() {
    local task="$1"
    local task_index="$2"
    
    log "MVP" "👨‍💻 Developer implementando: $task"
    
    local dev_prompt="Como Developer, implemente esta tarefa específica:

TAREFA ATUAL:
$task

CONTEXTO DO PROJETO:
- Iteração: $CURRENT_ITERATION
- Status: $MVP_STATUS
- Workspace: $CODE_DIR

INSTRUÇÕES:
1. Implemente código funcional e testável
2. Siga boas práticas da tecnologia escolhida
3. Inclua tratamento de erros básico
4. Documente código quando necessário
5. Sugira nome de arquivos e estrutura

DELIVERABLES:
- Código fonte completo
- Instruções de execução
- Dependências necessárias

Formato de resposta:
## IMPLEMENTAÇÃO

### Arquivo: [nome_do_arquivo]
\`\`\`[linguagem]
[código completo]
\`\`\`

### Arquivo: [nome_do_arquivo2] (se necessário)
\`\`\`[linguagem]
[código completo]
\`\`\`

## INSTRUÇÕES DE EXECUÇÃO
[como executar/testar o código]

## DEPENDÊNCIAS
[lista de dependências necessárias]

## OBSERVAÇÕES
[considerações importantes]"

    local context_files="$DOCS_DIR/product_requirements.md $DOCS_DIR/technical_architecture.md"
    local dev_response=$(execute_agent "Developer" "$dev_prompt" <(cat $context_files 2>/dev/null || echo ""))
    
    log "AGENT" "Resposta bruta do Developer:
$dev_response"
    
    # Salva a resposta completa do agente (incluindo markdown)
    echo "$dev_response" > "$CODE_DIR/task_${task_index}_implementation_raw.md"

    # Extrai e salva os blocos de código
    local saved_code_files=$(extract_and_save_code_blocks "$dev_response" "$CODE_DIR")
    
    log "SUCCESS" "✅ Tarefa implementada: $task. Arquivos de código gerados: $saved_code_files"
    echo "$saved_code_files"
}

tester_agent() {
    local implementation_files="$1"
    
    log "MVP" "🧪 Tester validando implementação..."
    
    local test_prompt="Como QA Tester, analise esta implementação e crie testes:

INSTRUÇÕES:
1. Analise o código implementado
2. Identifique cenários de teste principais
3. Crie testes automatizados se possível
4. Valide contra critérios de aceite
5. Reporte bugs/problemas encontrados

CÓDIGO IMPLEMENTADO:
$(for f in $implementation_files; do echo "### Arquivo: $(basename $f)"; cat "$f"; echo ""; done)

CRITÉRIOS DE ACEITE:
$ACCEPTANCE_CRITERIA

DELIVERABLES:
- Plano de testes
- Casos de teste específicos
- Testes automatizados (se aplicável)
- Relatório de qualidade

Formato de resposta:
## PLANO DE TESTES
[estratégia de teste]

## CASOS DE TESTE
### CT001: [nome do caso]
- **Pré-condições:** [requisitos]
- **Passos:** [ações a executar]
- **Resultado esperado:** [o que deve acontecer]

## TESTES AUTOMATIZADOS
\`\`\`[linguagem]
[código dos testes]
\`\`\`

## RELATÓRIO DE QUALIDADE
- ✅ Funcionalidade X: OK
- ❌ Funcionalidade Y: [problema encontrado]

## RECOMENDAÇÕES
[melhorias sugeridas]"

    local test_response=$(execute_agent "QA Tester" "$test_prompt" "$implementation_file")
    
    echo "$test_response" > "$TESTS_DIR/test_plan_iter${CURRENT_ITERATION}.md"
    
    log "SUCCESS" "🔍 Testes criados e validação concluída"
    echo "$test_response"
}

reviewer_agent() {
    local code_files="$1"
    local test_file="$2"
    
    log "MVP" "👁️ Code Reviewer analisando qualidade..."
    
    local review_prompt="Como Code Reviewer sênior, faça uma análise crítica:

INSTRUÇÕES:
1. Revise código quanto a qualidade, segurança, performance
2. Analise cobertura e qualidade dos testes
3. Verifique aderência aos requisitos
4. Identifique melhorias necessárias
5. Aprove ou rejeite para produção

CRITÉRIOS DE REVIEW:
- Funcionalidade: código faz o que deveria?
- Qualidade: código limpo, legível, manutenível?
- Segurança: sem vulnerabilidades óbvias?
- Performance: adequada para MVP?
- Testes: cobertura suficiente?

DELIVERABLES:
- Aprovação/Rejeição com justificativa
- Lista de melhorias obrigatórias
- Lista de melhorias sugeridas
- Score de qualidade (1-10)

Formato de resposta:
## DECISÃO: [APROVADO/REJEITADO/APROVADO COM RESSALVAS]

## SCORE DE QUALIDADE: [1-10]/10

## ANÁLISE DETALHADA
### Funcionalidade
[análise]

### Qualidade do Código
[análise]

### Segurança
[análise]

### Performance
[análise]

### Testes
[análise]

## MELHORIAS OBRIGATÓRIAS
- [ ] [melhoria 1]
- [ ] [melhoria 2]

## MELHORIAS SUGERIDAS
- [ ] [sugestão 1]
- [ ] [sugestão 2]

## JUSTIFICATIVA
[explicação da decisão]"

    local context_file=$(mktemp)
    {
        echo "=== CÓDIGO PARA REVIEW ==="
        for f in $code_files; do
            echo "### Arquivo: $(basename $f)"
            cat "$f" 2>/dev/null || echo "Arquivo de código não encontrado: $f"
            echo ""
        done
        echo "=== TESTES PARA REVIEW ==="
        cat "$test_file" 2>/dev/null || echo "Arquivo de testes não encontrado"
    } > "$context_file"
    
    local review_response=$(execute_agent "Code Reviewer" "$review_prompt" "$context_file")
    rm "$context_file"
    
    # Extrai decisão do review
    local decision=$(echo "$review_response" | grep "## DECISÃO:" | head -1)
    
    echo "$review_response" > "$REVIEWS_DIR/review_iter${CURRENT_ITERATION}.md"
    
    log "SUCCESS" "📝 Code review concluído: $decision"
    echo "$review_response"
}

mvp_validator_agent() {
    log "MVP" "🎯 MVP Validator verificando critérios de aceite..."
    
    local validator_prompt="Como MVP Validator, analise se o MVP está pronto para entrega:

CRITÉRIOS DE ACEITE ORIGINAIS:
$ACCEPTANCE_CRITERIA

INSTRUÇÕES:
1. Verifique cada critério de aceite
2. Teste funcionalidades implementadas
3. Valide se atende definição de pronto
4. Identifique gaps críticos
5. Recomende próximos passos

DELIVERABLES:
- Status de cada critério (✅ Atendido / ❌ Não atendido / ⚠️ Parcial)
- Avaliação geral do MVP
- Recomendação final (APROVAR/REJEITAR/MELHORAR)

Formato de resposta:
## STATUS DOS CRITÉRIOS

### CA1: [critério]
**Status:** [✅/❌/⚠️]
**Evidência:** [o que foi testado]
**Observações:** [detalhes]

## AVALIAÇÃO GERAL
- **Completude:** [%]
- **Qualidade:** [1-10]
- **Riscos:** [lista]

## RECOMENDAÇÃO: [APROVAR/REJEITAR/MELHORAR]

### Justificativa
[explicação detalhada]

### Próximos Passos
1. [ação 1]
2. [ação 2]"

    # Coleta todo contexto do projeto
    local context_file=$(mktemp)
    {
        echo "=== DOCUMENTAÇÃO ==="
        find "$DOCS_DIR" -name "*.md" -exec cat {} \; 2>/dev/null || echo "Sem documentação"
        echo ""
        echo "=== IMPLEMENTAÇÕES ==="
        find "$CODE_DIR" -name "*.md" -exec cat {} \; 2>/dev/null || echo "Sem código"
        echo ""
        echo "=== TESTES ==="
        find "$TESTS_DIR" -name "*.md" -exec cat {} \; 2>/dev/null || echo "Sem testes"
        echo ""
        echo "=== REVIEWS ==="
        find "$REVIEWS_DIR" -name "*.md" -exec cat {} \; 2>/dev/null || echo "Sem reviews"
    } > "$context_file"
    
    local validation_response=$(execute_agent "MVP Validator" "$validator_prompt" "$context_file")
    rm "$context_file"
    
    # Extrai recomendação
    local recommendation=$(echo "$validation_response" | grep "## RECOMENDAÇÃO:" | head -1)
    
    echo "$validation_response" > "$WORK_DIR/mvp_validation_iter${CURRENT_ITERATION}.md"
    
    log "SUCCESS" "🏁 Validação MVP concluída: $recommendation"
    echo "$validation_response"
}

# --- Loop Principal do MVP ---

update_mvp_status() {
    local new_status="$1"
    local reason="${2:-}"
    
    log "MVP" "Status MVP: $MVP_STATUS → $new_status $([ -n "$reason" ] && echo "($reason)")"
    MVP_STATUS="$new_status"
    
    # Atualiza arquivo de estado
    local state_file="$WORK_DIR/mvp_state.json"
    if command -v jq &> /dev/null; then
        jq ".status = \"$new_status\" | .iteration = $CURRENT_ITERATION | .updated = \"$(date -Iseconds)\"" "$state_file" > "${state_file}.tmp" && mv "${state_file}.tmp" "$state_file"
    fi
}

run_mvp_cycle() {
    local mvp_description="$1"
    
    create_workspace
    
    log "MVP" "🚀 Iniciando desenvolvimento do MVP..."
    log "INFO" "Descrição: $mvp_description"
    
    # Fase 1: Product Management
    update_mvp_status "PLANNING" "Definindo requisitos"
    product_manager_agent "$mvp_description"
    
    # Fase 2: Arquitetura Técnica
    architect_agent
    update_mvp_status "DEVELOPING" "Implementando soluções"
    
    # Controle inteligente de progresso
    local stagnation_counter=0
    local last_completed_count=${#COMPLETED_TASKS[@]}
    
    # Loop de desenvolvimento
    while [[ $CURRENT_ITERATION -lt $MAX_ITERATIONS && "$MVP_STATUS" != "COMPLETED" && "$MVP_STATUS" != "FAILED" ]]; do
        CURRENT_ITERATION=$((CURRENT_ITERATION + 1))
        log "MVP" "🔄 ITERAÇÃO $CURRENT_ITERATION/$MAX_ITERATIONS"
        
        # Implementa próxima tarefa
        if [[ ${#CURRENT_TASKS[@]} -gt 0 ]]; then
            local current_task="${CURRENT_TASKS[0]}"
            CURRENT_TASKS=("${CURRENT_TASKS[@]:1}")  # Remove primeira tarefa
            
            log "INFO" "Implementando: $current_task"
            local saved_code_files=$(developer_agent "$current_task" "$CURRENT_ITERATION")
            
            # Fase de testes
            update_mvp_status "TESTING" "Validando implementação"
            local tests=$(tester_agent "$saved_code_files")
            
            # Fase de review
            update_mvp_status "REVIEWING" "Revisando código"
            local test_plan_file="$TESTS_DIR/test_plan_iter${CURRENT_ITERATION}.md"
            local review=$(reviewer_agent "$saved_code_files" "$test_plan_file")
            
            # Verifica se review aprovou
            if echo "$review" | grep -q "APROVADO"; then
                COMPLETED_TASKS+=("$current_task")
                log "SUCCESS" "✅ Tarefa aprovada: $current_task"
            else
                FAILED_TASKS+=("$current_task")
                log "WARN" "❌ Tarefa rejeitada: $current_task"
            fi
            
            update_mvp_status "DEVELOPING" "Continuando desenvolvimento"
        fi
        
        # Detecta estagnação (sem progresso)
        local current_completed_count=${#COMPLETED_TASKS[@]}
        if [[ $current_completed_count -eq $last_completed_count ]]; then
            stagnation_counter=$((stagnation_counter + 1))
            log "WARN" "⚠️ Sem progresso há $stagnation_counter iterações"
            
            # Se estagnado por muito tempo, oferece opções
            if [[ $stagnation_counter -ge 5 ]]; then
                log "WARN" "🚨 Sistema estagnado! Aplicando estratégias de recuperação..."
                
                # Estratégia 1: Simplifica tarefas falhadas
                if [[ ${#FAILED_TASKS[@]} -gt 0 ]]; then
                    log "INFO" "📝 Simplificando tarefas que falharam..."
                    # Move tarefas falhadas de volta para current (serão simplificadas)
                    CURRENT_TASKS+=("${FAILED_TASKS[@]}")
                    FAILED_TASKS=()
                fi
                
                # Estratégia 2: Força validação antecipada se muitas tarefas concluídas
                if [[ ${#COMPLETED_TASKS[@]} -ge 3 ]]; then
                    log "INFO" "🎯 Forçando validação antecipada do MVP..."
                    CURRENT_TASKS=()  # Força validação
                fi
                
                stagnation_counter=0
            fi
        else
            stagnation_counter=0  # Reset contador se houve progresso
        fi
        
        last_completed_count=$current_completed_count
        
        # Verifica se todas as tarefas foram concluídas
        if [[ ${#CURRENT_TASKS[@]} -eq 0 ]]; then
            log "MVP" "🎯 Todas as tarefas concluídas. Validando MVP..."
            update_mvp_status "VALIDATING" "Verificando critérios de aceite"
            
            local validation=$(mvp_validator_agent)
            
            if echo "$validation" | grep -q "APROVAR"; then
                update_mvp_status "COMPLETED" "MVP aprovado"
                break
            elif echo "$validation" | grep -q "MELHORAR"; then
                # Adiciona novas tarefas se necessário
                log "WARN" "MVP precisa de melhorias. Continuando desenvolvimento..."
                update_mvp_status "DEVELOPING" "Implementando melhorias"
            else
                update_mvp_status "FAILED" "MVP rejeitado na validação"
            fi
        fi
    done
    
    # Verifica se deve estender automaticamente
    if [[ $CURRENT_ITERATION -ge $MAX_ITERATIONS && "$AUTO_EXTEND" == "true" ]]; then
        local total_tasks=$((${#COMPLETED_TASKS[@]} + ${#CURRENT_TASKS[@]} + ${#FAILED_TASKS[@]}))
        local progress_score=0
        if [[ $total_tasks -gt 0 ]]; then
            progress_score=$((${#COMPLETED_TASKS[@]} * 100 / $total_tasks))
        fi
        
        if [[ $progress_score -ge 50 && ${#CURRENT_TASKS[@]} -gt 0 ]]; then
            log "INFO" "🔄 Auto-extensão ativada! Progresso: ${progress_score}%. Adicionando +25 iterações..."
            MAX_ITERATIONS=$((MAX_ITERATIONS + 25))
            
            # Continua o loop
            while [[ $CURRENT_ITERATION -lt $MAX_ITERATIONS && "$MVP_STATUS" != "COMPLETED" && "$MVP_STATUS" != "FAILED" && ${#CURRENT_TASKS[@]} -gt 0 ]]; do
                CURRENT_ITERATION=$((CURRENT_ITERATION + 1))
                log "MVP" "🔄 ITERAÇÃO ESTENDIDA $CURRENT_ITERATION/$MAX_ITERATIONS"
                
                # Implementa próxima tarefa (lógica simplificada para extensão)
                local current_task="${CURRENT_TASKS[0]}"
                CURRENT_TASKS=("${CURRENT_TASKS[@]:1}")
                
                local implementation=$(developer_agent "$current_task" "$CURRENT_ITERATION")
                local test_file="$CODE_DIR/task_${CURRENT_ITERATION}_implementation.md"
                local tests=$(tester_agent "$test_file")
                local test_plan_file="$TESTS_DIR/test_plan_iter${CURRENT_ITERATION}.md"
                local review=$(reviewer_agent "$test_file" "$test_plan_file")
                
                if echo "$review" | grep -q "APROVADO"; then
                    COMPLETED_TASKS+=("$current_task")
                    log "SUCCESS" "✅ Tarefa aprovada: $current_task"
                else
                    FAILED_TASKS+=("$current_task")
                    log "WARN" "❌ Tarefa rejeitada: $current_task"
                fi
                
                # Validação final se não há mais tarefas
                if [[ ${#CURRENT_TASKS[@]} -eq 0 ]]; then
                    update_mvp_status "VALIDATING" "Verificando critérios de aceite"
                    local validation=$(mvp_validator_agent)
                    
                    if echo "$validation" | grep -q "APROVAR"; then
                        update_mvp_status "COMPLETED" "MVP aprovado"
                        break
                    elif echo "$validation" | grep -q "MELHORAR"; then
                        log "WARN" "MVP precisa de melhorias na extensão..."
                        # Adiciona uma tarefa de melhoria geral
                        CURRENT_TASKS+=("MELHORIA: Resolver pendências identificadas na validação")
                    else
                        update_mvp_status "FAILED" "MVP rejeitado na validação estendida"
                        break
                    fi
                fi
            done
        fi
    fi
    
    # Resultado final
    case "$MVP_STATUS" in
        "COMPLETED")
            log "SUCCESS" "🎉 MVP CONCLUÍDO COM SUCESSO!"
            log "INFO" "📊 Estatísticas: ${#COMPLETED_TASKS[@]} tarefas concluídas, ${#FAILED_TASKS[@]} falharam"
            log "INFO" "📁 Workspace: $WORK_DIR"
            ;;
        "FAILED")
            log "ERROR" "❌ MVP FALHOU na validação"
            log "INFO" "📊 Estatísticas: ${#COMPLETED_TASKS[@]} tarefas concluídas, ${#FAILED_TASKS[@]} falharam"
            ;;
        *)
            log "WARN" "⏰ MVP INCOMPLETO - Limite de iterações atingido"
            log "INFO" "📊 Estatísticas: ${#COMPLETED_TASKS[@]} tarefas concluídas, ${#FAILED_TASKS[@]} falharam"
            ;;
    esac
    
    # Gera relatório final
    generate_final_report
}

generate_final_report() {
    local report_file="$WORK_DIR/MVP_FINAL_REPORT.md"
    
    cat > "$report_file" << EOF
# Relatório Final do MVP - $SESSION_ID

## Status Final: $MVP_STATUS
**Iterações:** $CURRENT_ITERATION/$MAX_ITERATIONS  
**Data:** $(date)

## Estatísticas
- ✅ **Tarefas Concluídas:** ${#COMPLETED_TASKS[@]}
- ❌ **Tarefas Falharam:** ${#FAILED_TASKS[@]}
- ⏳ **Tarefas Pendentes:** ${#CURRENT_TASKS[@]}

## Arquivos Gerados
### Documentação
$(find "$DOCS_DIR" -name "*.md" | sed 's/^/- /' 2>/dev/null || echo "- Nenhum arquivo")

### Código
$(find "$CODE_DIR" -name "*.md" | sed 's/^/- /' 2>/dev/null || echo "- Nenhum arquivo")

### Testes
$(find "$TESTS_DIR" -name "*.md" | sed 's/^/- /' 2>/dev/null || echo "- Nenhum arquivo")

### Reviews
$(find "$REVIEWS_DIR" -name "*.md" | sed 's/^/- /' 2>/dev/null || echo "- Nenhum arquivo")

## Próximos Passos
$([ "$MVP_STATUS" = "COMPLETED" ] && echo "MVP pronto para deploy!" || echo "Consulte os logs para identificar problemas pendentes.")

---
*Relatório gerado automaticamente pelo MVP Shell*
EOF

    log "SUCCESS" "📄 Relatório final salvo: $report_file"
}

# --- Interface Principal ---

show_help() {
    echo "MVP Development Shell - Sistema Colaborativo Multi-Agente"
    echo ""
    echo "Uso: $0 [\"<descrição do MVP>\"]"
    echo ""
    echo "Se nenhuma descrição for fornecida, o script tentará ler de: $MVP_DESCRIPTION_FILE"
    echo ""
    echo "Exemplo:"
    echo "  $0 \"Sistema de login com JWT, cadastro de usuários e dashboard básico\""
    echo "  $0 # Usará a descrição de $MVP_DESCRIPTION_FILE"
    echo ""
    echo "O sistema executará automaticamente:"
    echo "  1. 🎯 Product Manager - Define requisitos e critérios"
    echo "  2. 🏗️ Arquiteto - Planeja solução técnica"
    echo "  3. 👨‍💻 Developer - Implementa funcionalidades"
    echo "  4. 🧪 Tester - Cria e executa testes"
    echo "  5. 👁️ Reviewer - Revisa código e qualidade"
    echo "  6. 🎯 Validator - Verifica critérios de aceite"
    echo ""
    echo "Variáveis de ambiente:"
    echo "  LLM_COMMAND=claude|gemini    (padrão: claude)"
    echo "  LOG_LEVEL=INFO|WARN|ERROR    (padrão: INFO)"
    echo "  MAX_ITERATIONS=50            (padrão: 50)"
    echo "  AUTO_EXTEND=true|false       (padrão: true - estende automaticamente se há progresso)"
}

main() {
    local mvp_description=""

    if [[ $# -gt 0 && ("$1" == "help" || "$1" == "--help" || "$1" == "-h") ]]; then
        show_help
        exit 0
    elif [[ $# -gt 0 ]]; then
        mvp_description="$1"
        log "INFO" "Descrição do MVP fornecida via argumento."
    else
        # Carrega a descrição do MVP de um arquivo
        if [[ ! -f "$MVP_DESCRIPTION_FILE" ]]; then
            log "ERROR" "Nenhuma descrição do MVP fornecida e arquivo não encontrado: $MVP_DESCRIPTION_FILE"
            show_help
            exit 1
        fi
        mvp_description=$(cat "$MVP_DESCRIPTION_FILE")
        log "INFO" "Descrição do MVP carregada de: $MVP_DESCRIPTION_FILE"
    fi
    
    # Verifica dependências
    if ! command -v "$LLM_COMMAND" &> /dev/null; then
        log "ERROR" "Comando LLM '$LLM_COMMAND' não encontrado no PATH."
        exit 1
    fi
    
    log "INFO" "🚀 MVP Development Shell iniciado"
    log "INFO" "🤖 LLM: $LLM_COMMAND"
    log "INFO" "📝 Descrição: $mvp_description"
    
    run_mvp_cycle "$mvp_description"
}

# Executa apenas se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
