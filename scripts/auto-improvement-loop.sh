#!/bin/bash

# Auto-improvement loop script for Project Wiz
# Executes Claude auto-improvement command continuously until code is healthy

set -e  # Exit on any error

ERROR_LOG="claude-errors.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run Claude auto-improvement and check if code is healthy
run_auto_improvement_and_check() {
    local iteration=$1
    
    print_status "🤖 Running Claude auto-improvement (iteration $iteration)..."
    
    # Check if Claude is available
    if ! command -v claude &> /dev/null; then
        print_error "Claude CLI not found. Please install Claude CLI first."
        print_error "Visit: https://docs.anthropic.com/en/docs/claude-code"
        exit 1
    fi
    
    # Create temporary file for Claude output
    local claude_output=$(mktemp)
    
    # Create instruction to force JSON response
    local json_instruction="

---

IMPORTANTE: Ao final da sua resposta, você DEVE incluir um JSON com o seguinte formato exato:
{\"healthy\": true/false, \"summary\": \"breve resumo do que foi feito\", \"issues_remaining\": number}

- healthy: true se o código está saudável e não precisa mais melhorias, false caso contrário
- summary: resumo conciso das melhorias feitas ou problemas encontrados
- issues_remaining: número estimado de problemas que ainda restam (0 se healthy=true)"

    # Execute Claude with auto-improvement command plus JSON instruction
    if (cat .claude/commands/auto-improvement.md; echo "$json_instruction") | claude --dangerously-skip-permissions --output-format json -p > "$claude_output" 2>>"$ERROR_LOG"; then
        print_success "Claude auto-improvement completed"
        
        # Extract healthy status from JSON response
        local is_healthy=$(grep -o '"healthy"[[:space:]]*:[[:space:]]*[^,}]*' "$claude_output" | grep -o 'true\|false' | tail -1)
        local summary=$(grep -o '"summary"[[:space:]]*:[[:space:]]*"[^"]*"' "$claude_output" | sed 's/.*"\(.*\)".*/\1/' | tail -1)
        
        if [ "$is_healthy" = "true" ]; then
            print_success "Claude indicates code is healthy! ✅"
            [ -n "$summary" ] && print_status "Summary: $summary"
            rm -f "$claude_output"
            return 0  # Code is healthy
        else
            print_status "Claude completed improvements, more work needed"
            [ -n "$summary" ] && print_status "Status: $summary"
            rm -f "$claude_output"
            return 1  # Code needs more work
        fi
    else
        local exit_code=$?
        print_error "Claude execution failed with exit code: $exit_code"
        rm -f "$claude_output"
        
        # Check if it's a usage limit error
        if [ -f "$ERROR_LOG" ]; then
            if grep -qi "usage limit\|rate limit\|quota exceeded\|limit reached" "$ERROR_LOG"; then
                print_error "🚫 Claude usage limit reached!"
                return 2  # Special exit code for usage limit
            fi
        fi
        
        return 1
    fi
}

# Main execution
main() {
    echo "🚀 Starting Auto-Improvement Loop for Project Wiz"
    echo "================================================="
    echo "This script will continuously run Claude auto-improvement"
    echo "until the code is healthy or Claude usage limit is reached."
    echo ""
    
    # Clean up previous error log
    rm -f "$ERROR_LOG"
    
    print_status "Starting auto-improvement loop..."
    
    # Main improvement loop
    iteration=0
    while true; do
        iteration=$((iteration + 1))
        
        echo ""
        echo "🔄 Iteration $iteration"
        echo "------------------------"
        
        # Run auto-improvement and check health in one call
        run_auto_improvement_and_check $iteration
        case $? in
            0)
                # Code is healthy - stop
                echo ""
                echo "=========================================="
                echo "🎯 AUTO-IMPROVEMENT COMPLETED"
                echo "=========================================="
                echo "Iterations completed: $iteration"
                print_success "🎉 Mission accomplished! Code is healthy."
                echo "=========================================="
                exit 0
                ;;
            1)
                # Code needs more work - continue
                print_status "Code still needs improvement, continuing..."
                ;;
            2)
                # Usage limit reached - stop
                print_error "Stopping due to Claude usage limit"
                exit 1
                ;;
        esac
        
		# Add small delay between iterations
        sleep 3
    done
}

# Handle script interruption
trap 'echo ""; print_warning "Script interrupted by user"; exit 130' INT

# Run main function
main "$@"