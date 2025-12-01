#!/bin/bash

# Trammarise Agent Workflow Manager
# This script simplifies running Claude Code agents in the correct sequence

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Banner
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Trammarise Agent Workflow Manager                       ║
║   Intelligent orchestration for Claude Code agents        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Print usage information
print_usage() {
    echo -e "${BLUE}Usage:${NC} ./agent-workflow.sh <command> [options]"
    echo ""
    echo -e "${GREEN}Commands:${NC}"
    echo ""
    echo -e "  ${YELLOW}start${NC} \"<request>\"          - Start a new workflow with the orchestrator"
    echo -e "  ${YELLOW}requirements${NC} \"<request>\"   - Analyze feature requirements"
    echo -e "  ${YELLOW}review${NC} \"<details>\"         - Review code quality and performance"
    echo -e "  ${YELLOW}test${NC} \"<details>\"           - Write unit tests"
    echo -e "  ${YELLOW}ux${NC} \"<component>\"           - Review UX and accessibility"
    echo -e "  ${YELLOW}help${NC}                      - Show this help message"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo ""
    echo -e "  # Start a new feature workflow"
    echo -e "  ./agent-workflow.sh start \"Add volume control slider to waveform player\""
    echo ""
    echo -e "  # Analyze requirements for a feature"
    echo -e "  ./agent-workflow.sh requirements \"Export audio in MP3 and WAV formats\""
    echo ""
    echo -e "  # Review implemented code"
    echo -e "  ./agent-workflow.sh review \"Review WaveformPlayer component for performance\""
    echo ""
    echo -e "  # Write tests"
    echo -e "  ./agent-workflow.sh test \"Create tests for useAudioRecorder hook\""
    echo ""
    echo -e "  # Review UX"
    echo -e "  ./agent-workflow.sh ux \"Review RecordingState component for accessibility\""
    echo ""
    echo -e "${BLUE}Workflow Tips:${NC}"
    echo -e "  1. Always ${YELLOW}start${NC} with the orchestrator for new requests"
    echo -e "  2. Follow the command sequence provided by the orchestrator"
    echo -e "  3. Use ${YELLOW}requirements${NC} before implementing new features"
    echo -e "  4. Use ${YELLOW}review${NC} after writing code"
    echo -e "  5. Use ${YELLOW}test${NC} after code review"
    echo -e "  6. Use ${YELLOW}ux${NC} for UI components"
    echo ""
}

# Check if claude-code is installed
check_claude_code() {
    if ! command -v claude-code &> /dev/null; then
        echo -e "${RED}Error: claude-code is not installed or not in PATH${NC}"
        echo -e "Please install Claude Code first: https://docs.claude.ai"
        exit 1
    fi
}

# Run agent with proper formatting
run_agent() {
    local agent=$1
    local prompt=$2
    local color=$3
    
    echo -e "${color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${color}Running Agent: ${agent}${NC}"
    echo -e "${color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Run claude-code with the agent
    claude-code --agent "$agent" "$prompt"
    
    local exit_code=$?
    
    echo ""
    echo -e "${color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓ Agent completed successfully${NC}"
    else
        echo -e "${RED}✗ Agent encountered an error (exit code: $exit_code)${NC}"
    fi
    
    echo -e "${color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    return $exit_code
}

# Main script logic
main() {
    print_banner
    
    # Check for arguments
    if [ $# -eq 0 ]; then
        print_usage
        exit 0
    fi
    
    # Check if claude-code is available
    check_claude_code
    
    local command=$1
    shift  # Remove first argument
    
    case "$command" in
        start)
            if [ -z "$1" ]; then
                echo -e "${RED}Error: Please provide a request${NC}"
                echo -e "Example: ./agent-workflow.sh start \"Add audio export feature\""
                exit 1
            fi
            
            echo -e "${CYAN}Starting workflow orchestration...${NC}"
            echo ""
            run_agent "orchestrator" "$1" "${CYAN}"
            
            echo ""
            echo -e "${GREEN}Next Steps:${NC}"
            echo -e "Follow the command sequence provided by the orchestrator above."
            echo -e "Copy and paste the commands, or use this script with the appropriate subcommands."
            ;;
            
        requirements|req|analyze)
            if [ -z "$1" ]; then
                echo -e "${RED}Error: Please provide a feature description${NC}"
                echo -e "Example: ./agent-workflow.sh requirements \"Audio transcription feature\""
                exit 1
            fi
            
            echo -e "${GREEN}Analyzing feature requirements...${NC}"
            echo ""
            run_agent "feature-requirements-analyzer" "$1" "${GREEN}"
            
            echo ""
            echo -e "${GREEN}Next Steps:${NC}"
            echo -e "1. Review the requirements document above"
            echo -e "2. Clarify any open questions with the user"
            echo -e "3. Implement the feature based on the specifications"
            echo -e "4. After implementation, run:"
            echo -e "   ${YELLOW}./agent-workflow.sh review \"Review [feature] implementation\"${NC}"
            ;;
            
        review|optimize|check)
            if [ -z "$1" ]; then
                echo -e "${RED}Error: Please provide details about what to review${NC}"
                echo -e "Example: ./agent-workflow.sh review \"Review WaveformPlayer for performance\""
                exit 1
            fi
            
            echo -e "${BLUE}Reviewing code quality and performance...${NC}"
            echo ""
            run_agent "fe-code-optimizer" "$1" "${BLUE}"
            
            echo ""
            echo -e "${GREEN}Next Steps:${NC}"
            echo -e "1. Address any critical issues identified above"
            echo -e "2. After fixes, proceed to testing:"
            echo -e "   ${YELLOW}./agent-workflow.sh test \"Create tests for [component]\"${NC}"
            ;;
            
        test|tests|testing)
            if [ -z "$1" ]; then
                echo -e "${RED}Error: Please specify what to test${NC}"
                echo -e "Example: ./agent-workflow.sh test \"Create tests for useAudioRecorder hook\""
                exit 1
            fi
            
            echo -e "${YELLOW}Writing unit tests...${NC}"
            echo ""
            run_agent "unit-test-writer" "$1" "${YELLOW}"
            
            echo ""
            echo -e "${GREEN}Next Steps:${NC}"
            echo -e "1. Add the generated tests to your codebase"
            echo -e "2. Run tests: ${YELLOW}npm test${NC}"
            echo -e "3. Verify all tests pass"
            echo -e "4. For UI components, consider UX review:"
            echo -e "   ${YELLOW}./agent-workflow.sh ux \"Review [component] for accessibility\"${NC}"
            ;;
            
        ux|ui|accessibility|a11y)
            if [ -z "$1" ]; then
                echo -e "${RED}Error: Please specify which component to review${NC}"
                echo -e "Example: ./agent-workflow.sh ux \"Review RecordingState component\""
                exit 1
            fi
            
            echo -e "${RED}Reviewing UX and accessibility...${NC}"
            echo ""
            run_agent "ux-component-reviewer" "$1" "${RED}"
            
            echo ""
            echo -e "${GREEN}Next Steps:${NC}"
            echo -e "1. Address high-priority UX issues"
            echo -e "2. Implement quick wins for immediate improvement"
            echo -e "3. Plan longer-term enhancements"
            echo -e "4. Re-run UX review after fixes to verify improvements"
            ;;
            
        help|-h|--help)
            print_usage
            ;;
            
        *)
            echo -e "${RED}Error: Unknown command '$command'${NC}"
            echo ""
            print_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"