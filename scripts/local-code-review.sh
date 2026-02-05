#!/bin/bash
# Local Code Review Script
# Run this before pushing to catch issues early

set -e

echo "🔍 Starting Local Code Review..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
REVIEW_PASSED=true

# 1. Check for uncommitted changes
echo "📋 Checking git status..."
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
fi
echo ""

# 2. Run linting
echo "🔧 Running ESLint..."
if npm run lint; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${RED}✗ Linting failed${NC}"
    REVIEW_PASSED=false
fi
echo ""

# 3. Run tests
echo "🧪 Running tests..."
if npm run test -- --run; then
    echo -e "${GREEN}✓ All tests passed${NC}"
else
    echo -e "${RED}✗ Tests failed${NC}"
    REVIEW_PASSED=false
fi
echo ""

# 4. Check for TypeScript errors (if tsc is available)
echo "📘 Checking TypeScript..."
if command -v tsc &> /dev/null; then
    if npx tsc --noEmit; then
        echo -e "${GREEN}✓ No TypeScript errors${NC}"
    else
        echo -e "${RED}✗ TypeScript errors found${NC}"
        REVIEW_PASSED=false
    fi
else
    echo -e "${YELLOW}⚠️  TypeScript compiler not found, skipping type check${NC}"
fi
echo ""

# 5. Show diff stats
echo "📊 Changes summary:"
git diff origin/main...HEAD --stat
echo ""

# 6. Check for common issues
echo "🔎 Checking for common issues..."

# Check for console.log (excluding test files)
if git diff origin/main...HEAD | grep -E "^\+.*console\.(log|warn|error)" | grep -v "test\|spec" > /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: Found console.log statements (review if intentional)${NC}"
fi

# Check for TODO/FIXME comments
if git diff origin/main...HEAD | grep -E "^\+.*(TODO|FIXME)" > /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: Found TODO/FIXME comments${NC}"
fi

# Check for debugger statements
if git diff origin/main...HEAD | grep -E "^\+.*debugger" > /dev/null; then
    echo -e "${RED}✗ Found debugger statements${NC}"
    REVIEW_PASSED=false
fi

echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$REVIEW_PASSED" = true ]; then
    echo -e "${GREEN}✅ Code review passed! Safe to push.${NC}"
    exit 0
else
    echo -e "${RED}❌ Code review failed. Please fix issues before pushing.${NC}"
    exit 1
fi
