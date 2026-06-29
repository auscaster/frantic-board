I'll create a comprehensive audit script for the runx CLI first-run experience. This script will analyze the CLI's behavior, documentation, error messages, and overall user experience for first-time users.

```commit-message
feat: add first-run experience audit script for runx CLI

- Create comprehensive audit script to evaluate CLI first-run experience
- Check documentation, help output, error messages, and onboarding flow
- Generate detailed report with scores and recommendations
- Include automated checks for common UX issues
```

```description
This script audits the runx CLI's first-run experience by:
1. Checking if the CLI is installed and accessible
2. Evaluating help output and documentation quality
3. Testing common first-run commands and error scenarios
4. Analyzing error messages for clarity and actionability
5. Checking for onboarding features (welcome messages, examples, etc.)
6. Generating a comprehensive report with scores and recommendations

The script is designed to be run by developers or QA engineers to identify UX issues that might frustrate new users.
```

```audit-runx-first-run.sh
#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# runx CLI First-Run Experience Audit Script
# ============================================================================
# This script audits the first-run experience of the runx CLI tool.
# It checks documentation, help output, error messages, and onboarding flow.
#
# Usage:
#   ./audit-runx-first-run.sh [--verbose] [--output report.md]
#
# Options:
#   --verbose       Show detailed output for each check
#   --output FILE   Write report to specified file (default: stdout)
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERBOSE=false
OUTPUT_FILE=""
SCORE=0
MAX_SCORE=100
FAILURES=0
WARNINGS=0
PASSES=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --output|-o)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--verbose] [--output report.md]"
            exit 1
            ;;
    esac
done

# Initialize report
REPORT=""

# Helper functions
log() {
    local level=$1
    local message=$2
    local color=$NC
    
    case $level in
        PASS) color=$GREEN;;
        FAIL) color=$RED;;
        WARN) color=$YELLOW;;
        INFO) color=$BLUE;;
    esac
    
    if [[ "$VERBOSE" == true ]] || [[ "$level" != "INFO" ]]; then
        echo -e "${color}[$level]${NC} $message"
    fi
}

add_to_report() {
    local section=$1
    local content=$2
    REPORT+="\n## $section\n\n$content\n"
}

check_command() {
    local cmd=$1
    local description=$2
    local weight=$3
    
    if command -v "$cmd" &> /dev/null; then
        log "PASS" "$description"
        SCORE=$((SCORE + weight))
        PASSES=$((PASSES + 1))
        return 0
    else
        log "FAIL" "$description - Command not found"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

check_output_contains() {
    local command=$1
    local expected=$2
    local description=$3
    local weight=$4
    
    if output=$(eval "$command" 2>&1); then
        if echo "$output" | grep -qi "$expected"; then
            log "PASS" "$description"
            SCORE=$((SCORE + weight))
            PASSES=$((PASSES + 1))
            return 0
        else
            log "FAIL" "$description - Expected '$expected' not found in output"
            FAILURES=$((FAILURES + 1))
            return 1
        fi
    else
        log "FAIL" "$description - Command failed to execute"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

check_output_not_contains() {
    local command=$1
    local unexpected=$2
    local description=$3
    local weight=$4
    
    if output=$(eval "$command" 2>&1); then
        if ! echo "$output" | grep -qi "$unexpected"; then
            log "PASS" "$description"
            SCORE=$((SCORE + weight))
            PASSES=$((PASSES + 1))
            return 0
        else
            log "FAIL" "$description - Found unexpected '$unexpected' in output"
            FAILURES=$((FAILURES + 1))
            return 1
        fi
    else
        log "FAIL" "$description - Command failed to execute"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

check_error_message_quality() {
    local command=$1
    local description=$2
    local weight=$3
    
    if output=$(eval "$command" 2>&1); then
        log "FAIL" "$description - Command succeeded when it should have failed"
        FAILURES=$((FAILURES + 1))
        return 1
    else
        # Check for common error message quality indicators
        local quality_score=0
        
        # Check if error message is not empty
        if [[ -n "$output" ]]; then
            quality_score=$((quality_score + 1))
        fi
        
        # Check if error message is human-readable (not a stack trace)
        if ! echo "$output" | grep -qi "panic\|stack trace\|runtime error"; then
            quality_score=$((quality_score + 1))
        fi
        
        # Check if error message suggests a solution
        if echo "$output" | grep -qi "try\|use\|install\|check\|see\|help\|--help\|-h"; then
            quality_score=$((quality_score + 1))
        fi
        
        # Check if error message is concise (under 500 chars)
        if [[ ${#output} -lt 500 ]]; then
            quality_score=$((quality_score + 1))
        fi
        
        if [[ $quality_score -ge 3 ]]; then
            log "PASS" "$description (quality score: $quality_score/4)"
            SCORE=$((SCORE + weight))
            PASSES=$((PASSES + 1))
            return 0
        else
            log "WARN" "$description - Poor error message quality (score: $quality_score/4)"
            WARNINGS=$((WARNINGS + 1))
            return 1
        fi
    fi
}

# ============================================================================
# Main Audit
# ============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  runx CLI First-Run Experience Audit${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Section 1: Installation and Basic Availability
echo -e "${YELLOW}[Section 1] Installation and Basic Availability${NC}"
add_to_report "Installation and Basic Availability" ""

# Check if runx is installed
if check_command "runx" "runx CLI is installed" 10; then
    add_to_report "Installation" "✅ runx CLI is installed and accessible"
    
    # Check version
    if version_output=$(runx --version 2>&1); then
        log "PASS" "runx --version works"
        SCORE=$((SCORE + 5))
        PASSES=$((PASSES + 1))
        add_to_report "Version" "✅ Version command works: \`$version_output\`"
    else
        log "FAIL" "runx --version failed"
        FAILURES=$((FAILURES + 1))
        add_to_report "Version" "❌ Version command failed"
    fi
else
    add_to_report "Installation" "❌ runx CLI is not installed. Please install it first."
    echo -e "${RED}Please install runx CLI before running this audit.${NC}"
    exit 1
fi

# Section 2: Help and Documentation
echo -e "\n${YELLOW}[Section 2] Help and Documentation${NC}"
add_to_report "Help and Documentation" ""

# Check help output
check_output_contains "runx --help" "Usage" "Help output contains 'Usage' section" 5
check_output_contains "runx --help" "Commands" "Help output lists available commands" 5
check_output_contains "runx --help" "Flags\|Options" "Help output shows flags/options" 5
check_output_contains "runx --help" "Examples\|Example" "Help output includes examples" 5

# Check if help is comprehensive
help_output=$(runx --help 2>&1)
add_to_report "Help Output" "\`\`\`\n$help_output\n\`\`\`"

# Check for common help sections
if echo "$help_output" | grep -qi "description\|about\|what is"; then
    log "PASS" "Help includes tool description"
    SCORE=$((SCORE + 3))
    PASSES=$((PASSES + 1))
fi

if echo "$help_output" | grep -qi "get started\|quickstart\|tutorial\|guide"; then
    log "PASS" "Help includes getting started guide"
    SCORE=$((SCORE + 3))
    PASSES=$((PASSES + 1))
fi

# Section 3: First-Run Experience
echo -e "\n${YELLOW}[Section 3] First-Run Experience${NC}"
add_to_report "First-Run Experience" ""

# Check for welcome message or onboarding
check_output_contains "runx" "Welcome\|Getting Started\|First time\|New to\|Welcome to" "CLI shows welcome/onboarding message" 10

# Check if running without arguments gives helpful output
check_output_not_contains "runx" "Error\|error\|ERROR\|panic\|PANIC" "Running without arguments doesn't show errors" 5

# Check if help is shown by default
check_output_contains "runx" "Usage\|Commands\|help" "Running without arguments shows help" 5

# Section 4: Command Completion and Suggestions
echo -e "\n${YELLOW}[Section 4] Command Completion and Suggestions${NC}"
add_to_report "Command Completion and Suggestions" ""

# Check for tab completion support
if runx completion --help &>/dev/null || runx completion bash &>/dev/null; then
    log "PASS" "Shell completion is supported"
    SCORE=$((SCORE + 5))
    PASSES=$((PASSES + 1))
    add_to_report "Shell Completion" "✅ Shell completion is supported"
else
    log "WARN" "Shell completion not detected"
    WARNINGS=$((WARNINGS + 1))
    add_to_report "Shell Completion" "⚠️ Shell completion not detected"
fi

# Check for command suggestions on typos
check_error_message_quality "runx helpp 2>&1" "Error message for typo 'helpp' is helpful" 8
check_error_message_quality "runx unknown-command 2>&1" "Error message for unknown command is helpful" 8

# Section 5: Configuration and Setup
echo -e "\n${YELLOW}[Section 5] Configuration and Setup${NC}"
add_to_report "Configuration and Setup" ""

# Check for init/setup command
if runx init --help &>/dev/null || runx setup --help &>/dev/null || runx configure --help &>/dev/null; then
    log "PASS" "Setup/init command exists"
    SCORE=$((SCORE + 5))
    PASSES=$((PASSES + 1))
    add_to_report "Setup Command" "✅ Setup/init command is available"
else
    log "WARN" "No setup/init command found"
    WARNINGS=$((WARNINGS + 1))
    add_to_report "Setup Command" "⚠️ No setup/init command found"
fi

# Check for config file documentation
check_output_contains "runx --help" "config\|configuration\|\.runx\|settings" "Help mentions configuration" 3

# Section 6: Error Handling
echo -e "\n${YELLOW}[Section 6] Error Handling${NC}"
add_to_report "Error Handling" ""

# Test various error scenarios
check_error_message_quality "runx --invalid-flag 2>&1" "Error message for invalid flag is helpful" 8
check_error_message_quality "runx command-that-does-not-exist 2>&1" "Error message for non-existent command is helpful" 8

# Check if errors suggest --help
if output=$(runx --invalid-flag 2>&1) || true; then
    if echo "$output" | grep -qi "help\|--help\|-h"; then
        log "PASS" "Error messages suggest using --help"
        SCORE=$((SCORE + 3))
        PASSES=$((PASSES + 1))
    fi
fi

# Section 7: Documentation Quality
echo -e "\n${YELLOW}[Section 7] Documentation Quality${NC}"
add_to_report "Documentation Quality" ""

# Check for man page
if man runx &>/dev/null; then
    log "PASS" "Man page is available"
    SCORE=$((SCORE + 5))
    PASSES=$((PASSES + 1))
    add_to_report "Man Page" "✅ Man page is available"
else
    log "WARN" "No man page found"
    WARNINGS=$((WARNINGS + 1))
    add_to_report "Man Page" "⚠️ No man page found"
fi

# Check for README or documentation
if [[ -f "README.md" ]] || [[ -f "README.rst" ]] || [[ -f "docs/index.md" ]]; then
    log "PASS" "Documentation files exist"
    SCORE=$((SCORE + 5))
    PASSES=$((PASSES + 1))
    add_to_report "Documentation Files" "✅ Documentation files exist"
else
    log "WARN" "No documentation files found in current directory"
    WARNINGS=$((WARNINGS + 1))
    add_to_report "Documentation Files" "⚠️ No documentation files found in current directory"
fi

# Section 8: Interactive Features
echo -e "\n${YELLOW}[Section 8] Interactive Features${NC}"
add_to_report "Interactive Features" ""

# Check for interactive mode or prompts
if runx interactive --help &>/dev/null || runx wizard --help &>/dev/null || runx guided --help &>/dev/null; then
    log "PASS" "Interactive/guided mode is available"
    SCORE=$((SCORE + 5))
    PASSES=$((PASSES + 1))
    add_to_report "Interactive Mode" "✅ Interactive/guided mode is available"
else
    log "INFO" "No interactive mode detected (may not be applicable)"
    add_to_report "Interactive Mode" "ℹ️ No interactive mode detected"
fi

# Check for progress indicators
if runx --help 2>&1 | grep -qi "progress\|verbose\|quiet\|silent"; then
    log "PASS" "Progress/output control flags are available"
    SCORE=$((SCORE + 3))
    PASSES=$((PASSES + 1))
    add_to_report "Progress Indicators" "✅ Progress/output control flags are available"
fi

# ============================================================================
# Generate Final Report
# ============================================================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Audit Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Calculate final score
MAX_SCORE=100
PERCENTAGE=$((SCORE * 100 / MAX_SCORE))

echo -e "Results:"
echo -e "  ${GREEN}Passed: $PASSES${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "  ${RED}Failed: $FAILURES${NC}"
echo -e "  Score: $SCORE/$MAX_SCORE ($PERCENTAGE%)"

# Generate grade
if [[ $PERCENTAGE -ge 90 ]]; then
    GRADE="A"
    GRADE_COLOR=$GREEN
elif [[ $PERCENTAGE -ge 80 ]]; then
    GRADE="B"
    GRADE_COLOR=$GREEN
elif [[ $PERCENTAGE -ge 70 ]]; then
    GRADE="C"
    GRADE_COLOR=$YELLOW
elif [[ $PERCENTAGE -ge 60 ]]; then
    GRADE="D"
    GRADE_COLOR=$YELLOW
else
    GRADE="F"
    GRADE_COLOR=$RED
fi

echo -e "  Grade: ${GRADE_COLOR}$GRADE${NC}"

# Add summary to report
add_to_report "Summary" "
- **Score**: $SCORE/$MAX_SCORE ($PERCENTAGE%)
- **Grade**: $GRADE
- **Passed Checks**: $PASSES
- **Warnings**: $WARNINGS
- **Failed Checks**: $FAILURES
"

# Generate recommendations
RECOMMENDATIONS=""
if [[ $PERCENTAGE -lt 90 ]]; then
    RECOMMENDATIONS+="\n### Recommendations for Improvement\n\n"
    
    if ! echo "$help_output" | grep -qi "Examples\|Example"; then
        RECOMMENDATIONS+="- Add examples to the help output\n"
    fi
    
    if ! echo "$help_output" | grep -qi "get started\|quickstart"; then
        RECOMMENDATIONS+="- Add a 'Getting Started' section to help\n"
    fi
    
    if ! runx completion --help &>/dev/null; then
        RECOMMENDATIONS+="- Implement shell completion support\n"
    fi
    
    if ! runx init --help &>/dev/null && ! runx setup --help &>/dev/null; then
        RECOMMENDATIONS+="- Add