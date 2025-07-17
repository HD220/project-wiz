#!/bin/bash

# Script para análise contínua de DX e Clean Code com Claude CLI
# Autor: Assistente Claude
# Data: $(date)
# Uso: ./improve.sh [prompt_customizado]

set -euo pipefail

# Configurações
CLAUDE_CLI="claude"
OUTPUT_FORMAT="json"
SLEEP_BETWEEN_RETRIES=30
TARGET_HEALTH=90

# Captura prompt customizado do argumento, se fornecido
CUSTOM_PROMPT="${1:-}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Prompt base para análise de DX e Clean Code
BASE_PROMPT='## Análise e Refatoração Prática

Você é um especialista em Clean Code, arquitetura de software e Developer Experience (DX). Sua missão é analisar o código fornecido e melhorá-lo seguindo estas diretrizes:

## FOCO PRINCIPAL:

- **Clean Code**: Código limpo, legível e maintível
- **DX (Developer Experience)**: Experiência fluida para desenvolvedores
- **Organização**: Estrutura lógica e consistente
- **Simplicidade**: Reduzir complexidade desnecessária
- **Praticidade**: Soluções eficientes e diretas

### 1. ANÁLISE REAL DA SITUAÇÃO

**Mapeie os problemas reais:**

- Onde está difícil de encontrar código?
- Quais arquivos estão grandes demais?
- Onde tem código duplicado?
- Qual parte dá mais trabalho para manter?
- Onde falta tipagem adequada?
- Quais componentes fazem coisa demais?
- Identifique code smells e anti-patterns
- Sugira refatorações para melhor legibilidade
- Aplique princípios SOLID quando apropriado
- Remova duplicação e código morto
- Melhore naming conventions
- Identifique oportunidades para usar bibliotecas que simplifiquem o código
- Sugira ferramentas que melhorem DX (linting, formatting, etc.)
- Recomende alternativas mais modernas/eficientes
- Considere bundle size e performance
- Estabeleça padrões consistentes
- Sugira convenções de nomenclatura
- Padronize estruturas de dados
- Unifique estilos de código
- Comandos úteis para automatizar tarefas
- Configurações que melhoram workflow
- Ferramentas de desenvolvimento

**Identifique por dor real:**

- **URGENTE**: Código que quebra frequentemente
- **IMPORTANTE**: Código difícil de manter/encontrar
- **ÚTIL**: Melhorias que facilitam desenvolvimento
- **PODE ESPERAR**: Otimizações menores

### 2. DIRETRIZES PRÁTICAS

- **Progressivo**: Mudanças incrementais, não revolucionárias
- **Pragmático**: Soluções práticas, não teóricas
- **Testável**: Código que facilita testes
- **Documentado**: Código auto-explicativo
- **Consistente**: Padrões uniformes em todo projeto

**Object Calisthenics aplicados na prática:**

- Indentação máxima de 2 níveis
- Evitar else (usar early returns)
- Objetos pequenos e focados
- Nomes que explicam o que fazem
- Funções pequenas (máximo 20 linhas)

**KISS aplicado:**

- Se não está quebrado, não mexe
- Solução mais simples que funciona
- Evitar abstrações desnecessárias
- Código que qualquer dev entende
- Convenções óbvias

**Organização por funcionalidade:**

- Agrupar por feature, não por tipo de arquivo
- Colocar junto o que muda junto
- Separar apenas quando necessário
- Estrutura que facilita encontrar código

### 3. PROCESSO PRÁTICO DE EXECUÇÃO

**Para cada execução:**

1. **Identifique a dor** mais chata atualmente
2. **Analise os arquivos** relacionados
3. **Faça um plano simples** de reorganização

### 4. CRITÉRIOS DE QUALIDADE REAL

**Cada refatoração deve:**

- Resolver uma dor real
- Manter funcionalidade exata
- Deixar código mais fácil de entender
- Reduzir duplicação
- Melhorar tipagem TypeScript
- Facilitar manutenção

**Sinais de que está no caminho certo:**

- Menos linhas de código total
- Mais fácil encontrar onde mexer
- Menos bugs aparecem
- Mais fácil adicionar features
- Menos tempo para entender código

**Evite:**

- Abstrações complexas
- Patterns desnecessários
- Separação excessiva
- Código que ninguém entende
- Soluções over-engineered

---

Analise a codebase e identifique qual é a maior dor atual para desenvolver e manter. Foque em resolver esse problema específico com a solução mais simples possível, mantendo a funcionalidade exata mas melhorando significativamente a experiência de desenvolvimento.

Siga as diretrizes práticas acima para:

1. Identificar problemas reais (não teóricos)
2. Implementar soluções efetivas
3. Manter funcionalidade exata
4. Melhorar experiência de desenvolvimento
5. Documentar mudanças feitas

Tome extremo cuidado ao realizar a refatoração, considere todos os aspectos de diferentes ângulos, pense o que pode quebrar com a alteração, faça alterações completas, pense em alterar algo veja quem depende disso que está sendo alterado, o que mais precisa ser corrigido para atender a essa refatoração, sempre deve sair de um código funcionando para outro código funcionando só que mais legível e com melhor manutenibilidade.

IMPORTANTE: Responda SEMPRE em formato JSON válido seguindo exatamente esta estrutura, SOMENTE o JSON SEM QUAISQUER OUTROS DADOS ELE VAI SER DIRETAMENTE PARSEADO:

{
  "health": 85,
  "actions_taken": [
    {
      "type": "refactor",
      "file": "src/utils/helper.js",
      "description": "Renomeei função getData() para fetchUserData() para melhor clareza",
      "impact": "Melhorou legibilidade e semântica"
    },
    {
      "type": "cleanup",
      "file": "src/components/Button.jsx",
      "description": "Removi código duplicado e criei hook customizado useButtonState()",
      "impact": "Reduziu complexidade e aumentou reutilização"
    }
  ],
  "files_modified": [
    "src/utils/helper.js",
    "src/components/Button.jsx"
  ],
  "improvements_made": {
    "dx_improvements": 3,
    "clean_code_improvements": 5,
    "performance_improvements": 2,
    "documentation_improvements": 1
  },
  "next_steps": [
    "Implementar testes unitários para as funções refatoradas",
    "Configurar ESLint com regras mais restritivas"
  ]
}

EXECUTE AS MELHORIAS AGORA:'

# Função para logging
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" >&2
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

# Função para verificar se o Claude CLI está disponível
check_claude_cli() {
    if ! command -v "$CLAUDE_CLI" &> /dev/null; then
        error "Claude CLI não encontrado. Certifique-se de que está instalado e no PATH."
        exit 1
    fi
}

# Função para extrair a saúde do código do resultado JSON
extract_health_score() {
    local json_content="$1"
    
    # Tenta extrair o score de saúde do JSON
    local health_score=$(echo "$json_content" | jq -r '
        .health // 
        .score // 
        .health_score // 
        .saude // 
        .pontuacao // 
        (.content | try fromjson | .health) // 
        (.content | try fromjson | .score) //
        0
    ' 2>/dev/null || echo "0")
    
    # Remove % se presente e converte para número
    health_score=$(echo "$health_score" | sed 's/%//g' | grep -oE '[0-9]+' | head -1)
    
    echo "${health_score:-0}"
}

# Função para verificar se o JSON é válido
validate_json() {
    local json_content="$1"
    
    if echo "$json_content" | jq empty 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Função para verificar se houve erro de cota
check_quota_error() {
    local content="$1"
    
    if [[ "$content" == *"quota"* ]] || [[ "$content" == *"rate limit"* ]] || [[ "$content" == *"exceeded"* ]] || [[ "$content" == *"too many requests"* ]]; then
        return 0
    fi
    
    # Tenta verificar no JSON estruturado
    local error_msg=$(echo "$content" | jq -r '.error // .message // ""' 2>/dev/null)
    
    if [[ "$error_msg" == *"quota"* ]] || [[ "$error_msg" == *"rate limit"* ]] || [[ "$error_msg" == *"exceeded"* ]]; then
        return 0
    fi
    
    return 1
}

# Função para construir o prompt com o resultado anterior
build_prompt() {
    local iteration="$1"
    local previous_result="$2"
    
    # Usa prompt customizado se fornecido, senão usa o BASE_PROMPT
    local prompt="${CUSTOM_PROMPT:-$BASE_PROMPT}"
    
    # Se não é a primeira iteração, adiciona o resultado anterior
    if [[ $iteration -gt 1 && -n "$previous_result" ]]; then
        prompt="$prompt

RESULTADO DA ITERAÇÃO ANTERIOR:
$previous_result

Com base no que já foi executado, continue implementando as melhorias restantes. Foque nos próximos passos indicados anteriormente.

EXECUTE novas melhorias e reporte:
1. O que você FEZ nesta iteração
2. Quais arquivos foram MODIFICADOS
3. Qual a nova saúde do código após suas modificações
4. Próximos passos para atingir 90%

IMPORTANTE: Mantenha o formato JSON exato. O campo 'health' deve refletir a saúde APÓS suas modificações nesta iteração."
    fi
    
    echo "$prompt"
}

# Função para executar o Claude CLI
execute_claude() {
    local prompt="$1"
    
    # Executa o Claude CLI e captura o resultado
    local result
    result=$("$CLAUDE_CLI" --dangerously-skip-permissions --print "$prompt" --output-format json 2>&1)
    
    local exit_code=$?
    
    # Se a execução foi bem-sucedida, executa formatação e commit
    if [[ $exit_code -eq 0 ]]; then
        log "Formatando código e fazendo commit das alterações..."
        
        # Formatar código
        if npm run format &>/dev/null; then
            log "✅ Código formatado"
        else
            warning "⚠️ Erro ao formatar código"
        fi
        
        # Adicionar arquivos e fazer commit
        if git add . &>/dev/null && git commit -m "refatoração massiva" &>/dev/null; then
            log "✅ Commit realizado com sucesso"
        else
            warning "⚠️ Nenhuma alteração para commitar ou erro no commit"
        fi
    fi
    
    # Retorna o resultado via stdout
    echo "$result"
    
    return $exit_code
}

# Função para exibir resumo da análise
show_analysis_summary() {
    local json_content="$1"
    
    if ! validate_json "$json_content"; then
        return
    fi
    
    local health=$(echo "$json_content" | jq -r '.health // 0' 2>/dev/null)
    local actions_count=$(echo "$json_content" | jq -r '.actions_taken | length' 2>/dev/null)
    local files_modified=$(echo "$json_content" | jq -r '.files_modified | length' 2>/dev/null)
    local dx_improvements=$(echo "$json_content" | jq -r '.improvements_made.dx_improvements // 0' 2>/dev/null)
    local clean_code_improvements=$(echo "$json_content" | jq -r '.improvements_made.clean_code_improvements // 0' 2>/dev/null)
    
    log "📊 Resumo da Execução:"
    log "   Saúde Atual: ${health}%"
    log "   Ações Executadas: ${actions_count}"
    log "   Arquivos Modificados: ${files_modified}"
    log "   Melhorias DX: ${dx_improvements}"
    log "   Melhorias Clean Code: ${clean_code_improvements}"
}

# Função principal
main() {
    log "Iniciando análise contínua de DX e Clean Code"
    log "Diretório atual: $(pwd)"
    
    # Verificações iniciais
    check_claude_cli
    
    # Verifica se jq está disponível
    if ! command -v jq &> /dev/null; then
        error "jq não encontrado. Instale com: sudo apt-get install jq (Ubuntu/Debian) ou brew install jq (macOS)"
        exit 1
    fi
    
    local iteration=1
    local previous_result=""
    local current_health=0
    local claude_result=""
    
    while true; do
        log "=== ITERAÇÃO $iteration ==="
        
        # Constrói o prompt
        local prompt=$(build_prompt "$iteration" "$previous_result")
        
        log "Executando análise..."
        
        # Executa o Claude CLI
        if claude_result=$(execute_claude "$prompt"); then
            # Verifica se o JSON é válido
            if validate_json "$claude_result"; then
                success "Análise executada com sucesso"
                
                # Exibe resumo da análise
                show_analysis_summary "$claude_result"
                
                # Extrai o score de saúde
                current_health=$(extract_health_score "$claude_result")
                log "Saúde atual do código: ${current_health}%"
                
                # Verifica se atingiu o objetivo
                if [[ $current_health -ge $TARGET_HEALTH ]]; then
                    success "Meta de saúde atingida! (${current_health}% >= ${TARGET_HEALTH}%)"
                    success "Análise concluída após $iteration iterações"
                    
                    # Exibe próximos passos se disponíveis
                    local next_steps=$(echo "$claude_result" | jq -r '.next_steps[]?' 2>/dev/null)
                    if [[ -n "$next_steps" ]]; then
                        log "🚀 Próximos passos recomendados:"
                        echo "$next_steps" | while read -r step; do
                            log "   • $step"
                        done
                    fi
                    
                    # Exibe o resultado final
                    echo "$claude_result"
                    break
                fi
                
                # Prepara resultado para próxima iteração
                previous_result="$claude_result"
                
            else
                error "Resposta inválida do Claude (JSON malformado)"
                log "Conteúdo recebido:"
                echo "$claude_result" >&2
                
                # Verifica se é erro de cota
                if check_quota_error "$claude_result"; then
                    warning "Erro de cota detectado. Aguardando ${SLEEP_BETWEEN_RETRIES}s antes de tentar novamente..."
                    sleep $SLEEP_BETWEEN_RETRIES
                    continue
                else
                    error "Erro crítico: JSON malformado sem ser erro de cota"
                    break
                fi
            fi
            
        else
            error "Erro na execução do Claude CLI"
            
            # Verifica se é erro de cota
            if check_quota_error "$claude_result"; then
                warning "Erro de cota detectado. Aguardando ${SLEEP_BETWEEN_RETRIES}s antes de tentar novamente..."
                sleep $SLEEP_BETWEEN_RETRIES
                continue
            else
                error "Erro crítico na execução do Claude CLI. Detalhes:"
                echo "$claude_result" >&2
                break
            fi
        fi
        
        iteration=$((iteration + 1))
        
        # Pausa entre iterações
        log "Aguardando antes da próxima iteração..."
        sleep 5
    done
    
    # Resultado final
    if [[ $current_health -ge $TARGET_HEALTH ]]; then
        success "🎉 Análise concluída com sucesso!"
        success "Saúde final do código: ${current_health}%"
    else
        warning "Análise finalizada devido a erro crítico"
        warning "Saúde final do código: ${current_health}%"
    fi
}

# Função para limpeza em caso de interrupção
cleanup() {
    log "Script interrompido."
    exit 1
}

# Captura sinais de interrupção
trap cleanup INT TERM

# Executa função principal
main "$@"
