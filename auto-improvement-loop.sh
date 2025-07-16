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

# Function to check if code is healthy (no lint/typescript errors)
check_code_health() {
    print_status "Checking code health..."
    
    local has_errors=false
    
    # Check TypeScript errors
    if ! npm run type-check > /dev/null 2>&1; then
        print_warning "TypeScript errors found"
        has_errors=true
    fi
    
    # Check ESLint errors
    if ! npm run lint:check > /dev/null 2>&1; then
        print_warning "ESLint errors found"
        has_errors=true
    fi
    
    if [ "$has_errors" = false ]; then
        print_success "Code is healthy! ✅ No TypeScript or ESLint errors"
        return 0
    else
        return 1
    fi
}

# Function to run Claude auto-improvement
run_auto_improvement() {
    local iteration=$1
    
    print_status "🤖 Running Claude auto-improvement (iteration $iteration)..."
    
    # Check if Claude is available
    if ! command -v claude &> /dev/null; then
        print_error "Claude CLI not found. Please install Claude CLI first."
        print_error "Visit: https://docs.anthropic.com/en/docs/claude-code"
        exit 1
    fi
    
    # Execute Claude with auto-improvement command using correct CLI syntax
    if cat .claude/commands/auto-improvement.md | claude --dangerously-skip-permissions -p 2>>"$ERROR_LOG"; then
        print_success "Claude auto-improvement completed"
        return 0
    else
        local exit_code=$?
        print_error "Claude execution failed with exit code: $exit_code"
        
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
    
    # Initial health check
    if check_code_health; then
        print_success "🎉 Code is already healthy! No improvements needed."
        exit 0
    fi
    
    print_status "Code needs improvement. Starting auto-improvement loop..."
    
    # Main improvement loop
    iteration=0
    while true; do
        iteration=$((iteration + 1))
        
        echo ""
        echo "🔄 Iteration $iteration"
        echo "------------------------"
        
        # Run auto-improvement
        improvement_result=$(run_auto_improvement $iteration)
        case $? in
            0)
                # Success - Claude completed the improvement
                print_success "Claude completed iteration $iteration"
                ;;
            1)
                # Error but not usage limit - continue trying
                print_warning "Claude encountered an error, but continuing..."
                continue
                ;;
            2)
                # Usage limit reached - stop
                print_error "Stopping due to Claude usage limit"
                exit 1
                ;;
        esac
        
        # Wait a moment before checking health
        sleep 2
        
        # Check if code is now healthy
        if check_code_health; then
            echo ""
            echo "=========================================="
            echo "🎯 AUTO-IMPROVEMENT COMPLETED"
            echo "=========================================="
            echo "Iterations completed: $iteration"
            print_success "🎉 Mission accomplished! Code is healthy."
            echo "=========================================="
            exit 0
        fi
        
        print_status "Code still needs improvement, continuing..."
        
        # Add small delay between iterations
        sleep 3
    done
}

# Handle script interruption
trap 'echo ""; print_warning "Script interrupted by user"; exit 130' INT

# Run main function
main "$@"