# Trammarise Agent Workflow System

Complete orchestration system for managing Claude Code agents using **Option B** (orchestrator-driven workflow).

## 📋 Table of Contents

- [Overview](#overview)
- [Available Agents](#available-agents)
- [Setup](#setup)
- [Usage](#usage)
- [Complete Workflow Examples](#complete-workflow-examples)
- [Shell Script Reference](#shell-script-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This system provides an orchestrated workflow for React/TypeScript development with specialized AI agents. Instead of calling agents randomly, you **always start with the orchestrator**, which analyzes your request and provides the exact sequence of commands to run.

### Key Benefits

✅ **Consistent workflow** - Always follow the right sequence  
✅ **Clear instructions** - Exact commands to copy/paste  
✅ **Quality assurance** - Requirements → Implementation → Review → Testing → UX  
✅ **Automated handoffs** - Each agent guides you to the next step  
✅ **Shell script helpers** - Quick commands for common workflows

---

## 🤖 Available Agents

### 1. **Orchestrator** (Cyan)
- **Purpose**: Analyzes requests and provides exact agent command sequences
- **When to use**: ALWAYS start here for any new request
- **Output**: Complete workflow with commands, checklist, and notes

### 2. **Feature Requirements Analyzer** (Green)
- **Purpose**: Transforms feature ideas into complete, implementation-ready specs
- **When to use**: Before implementing any new feature
- **Output**: Requirements doc with use cases, technical specs, and acceptance criteria

### 3. **Frontend Code Optimizer** (Default)
- **Purpose**: Reviews code for quality, performance, browser compatibility, and bugs
- **When to use**: After implementation, for bug investigation, or code reviews
- **Output**: Detailed analysis with specific fixes, optimization opportunities

### 4. **Unit Test Writer** (Yellow)
- **Purpose**: Creates comprehensive test coverage with proper mocking
- **When to use**: After implementation or bug fixes
- **Output**: Complete test files ready to run

### 5. **UX Component Reviewer** (Red)
- **Purpose**: Evaluates UX quality and accessibility (WCAG 2.1)
- **When to use**: After creating or modifying UI components
- **Output**: TODO comments, accessibility checklist, quick wins, enhancements

---

## 🚀 Setup

### Prerequisites

- Claude Code installed and configured
- Trammarise project (React + TypeScript + Vite)
- Bash shell (macOS/Linux/WSL)

### Installation

1. **Place agent files** in your Claude Code agents directory:
   ```bash
   # Typical location (adjust if different):
   ~/.config/claude-code/agents/
   ```

   Copy these files:
   - `orchestrator.md`
   - `feature-requirements-analyzer.md`
   - `fe-code-optimizer.md`
   - `unit-test-writer.md`
   - `ux-component-reviewer.md`

2. **Install the shell script helper**:
   ```bash
   # Copy to your project root
   cp agent-workflow.sh /path/to/trammarise/
   
   # Make it executable
   chmod +x agent-workflow.sh
   ```

3. **Verify installation**:
   ```bash
   # Test that claude-code can see the agents
   claude-code --list-agents
   
   # Should show: orchestrator, feature-requirements-analyzer, 
   # fe-code-optimizer, unit-test-writer, ux-component-reviewer
   ```

---

## 📖 Usage

### The Golden Rule

**Always start with the orchestrator**. Never skip this step.

### Basic Workflow

```bash
# Step 1: Start with orchestrator (ALWAYS)
claude-code --agent orchestrator "Your request here"

# Step 2: Follow the exact commands provided by orchestrator
# (Copy/paste from orchestrator output)

# Step 3: Repeat until workflow complete
```

### Using the Shell Script (Recommended)

```bash
# Easier syntax with the helper script:
./agent-workflow.sh start "Your request here"

# Then follow the commands in the output
```

---

## 🎬 Complete Workflow Examples

### Example 1: Adding a New Feature (Volume Control)

**Step 1: Start with orchestrator**
```bash
claude-code --agent orchestrator "Add a volume control slider to the waveform player"
```

**Orchestrator output:**
```markdown
## 🎯 Analysis
User wants to add a volume control slider...

## 💻 Commands to Execute

### Step 1: Define Requirements
```bash
claude-code --agent feature-requirements-analyzer "Analyze requirements for volume control slider..."
```
```

**Step 2: Run the first command**
```bash
# Copy from orchestrator output
claude-code --agent feature-requirements-analyzer "Analyze requirements for volume control slider in WaveformPlayer..."
```

**Requirements analyzer output:**
```markdown
## 🎯 FEATURE SUMMARY
Volume control slider for waveform player...

## ✅ CORE REQUIREMENTS
1. User can adjust volume from 0% to 100%
2. Volume persists across sessions
...

## 🔄 HANDOFF TO ORCHESTRATOR
Requirements complete. After implementation, run:
```bash
claude-code --agent orchestrator "Requirements defined: [paste doc]. Ready for review."
```
```

**Step 3: Implement the feature** (you do this manually)

**Step 4: Review implementation**
```bash
# From orchestrator's original output
claude-code --agent fe-code-optimizer "Review volume control slider implementation..."
```

**Step 5: Create tests**
```bash
# From orchestrator's original output
claude-code --agent unit-test-writer "Write tests for volume control slider..."
```

**Step 6: UX review**
```bash
# From orchestrator's original output
claude-code --agent ux-component-reviewer "Review volume control slider component..."
```

**Done!** ✅

---

### Example 2: Fixing a Bug

**Step 1: Report to orchestrator**
```bash
claude-code --agent orchestrator "The waveform doesn't update after I trim the audio"
```

**Orchestrator provides:**
```bash
# Step 1: Investigate
claude-code --agent fe-code-optimizer "Investigate why waveform doesn't update after trimming. Analyze WaveformPlayer state management..."
```

**Step 2: Run investigation**
```bash
claude-code --agent fe-code-optimizer "Investigate why waveform doesn't update..."
```

**Code optimizer output:**
```markdown
## 🔴 Critical Issues

**Missing WaveSurfer reload after trim**
- Location: `src/components/WaveformPlayer.tsx:142`
- Problem: trimAudio updates buffer but doesn't trigger waveform refresh
- Fix:
```typescript
// After trimming
const newBuffer = trimAudioBuffer(audioBuffer, start, end);
setAudioBuffer(newBuffer);
wavesurfer.loadBlob(bufferToBlob(newBuffer)); // ADD THIS LINE
```

## Next Steps:
After fix, add regression tests:
```bash
claude-code --agent unit-test-writer "Create regression tests for waveform update bug..."
```
```

**Step 3: Implement fix** (you do this)

**Step 4: Add tests**
```bash
claude-code --agent unit-test-writer "Create regression tests for waveform update bug covering trim operations"
```

**Done!** ✅

---

### Example 3: Code Review Request

**Step 1: Request review**
```bash
claude-code --agent orchestrator "Review my new useAudioRecorder hook implementation"
```

**Orchestrator provides:**
```bash
claude-code --agent fe-code-optimizer "Review useAudioRecorder hook for React best practices, MediaRecorder API usage, error handling, memory management..."
```

**Step 2: Run review**
```bash
claude-code --agent fe-code-optimizer "Review useAudioRecorder hook..."
```

**Step 3: Address feedback and optionally add tests**
```bash
# If recommended by code optimizer
claude-code --agent unit-test-writer "Write tests for useAudioRecorder hook..."
```

**Done!** ✅

---

## 🛠️ Shell Script Reference

The `agent-workflow.sh` script provides convenient shortcuts:

### Commands

```bash
# Start a workflow (calls orchestrator)
./agent-workflow.sh start "Your request"

# Analyze requirements
./agent-workflow.sh requirements "Feature description"

# Review code
./agent-workflow.sh review "What to review"

# Write tests
./agent-workflow.sh test "What to test"

# Review UX
./agent-workflow.sh ux "Component to review"

# Show help
./agent-workflow.sh help
```

### Examples

```bash
# Start new feature workflow
./agent-workflow.sh start "Add audio export as MP3"

# Analyze requirements for a feature
./agent-workflow.sh requirements "Export audio in multiple formats"

# Review code after implementation
./agent-workflow.sh review "Review AudioExporter component for browser compatibility"

# Write tests
./agent-workflow.sh test "Create tests for AudioExporter including format conversion"

# Review UX
./agent-workflow.sh ux "Review ExportModal component for accessibility"
```

### Script Output

The script provides:
- Colored output for better readability
- Clear separation between agent runs
- Success/failure indicators
- Next step suggestions

---

## ✅ Best Practices

### DO

✅ **Always start with orchestrator** for new requests  
✅ **Follow the command sequence** provided by orchestrator  
✅ **Copy commands exactly** as provided (includes important context)  
✅ **Complete one step** before moving to next  
✅ **Read agent outputs carefully** - they contain valuable guidance  
✅ **Use shell script** for convenience (`./agent-workflow.sh start "..."`)  

### DON'T

❌ **Don't skip orchestrator** - it ensures proper sequencing  
❌ **Don't modify commands** unless you understand the implications  
❌ **Don't run agents out of order** - requirements → implementation → review → test → UX  
❌ **Don't ignore agent feedback** - they identify real issues  
❌ **Don't forget to implement** - agents provide guidance, you write code  

### Workflow Order

The correct sequence for new features:

```
1. orchestrator (analyze request)
   ↓
2. feature-requirements-analyzer (define specs)
   ↓
3. [YOU IMPLEMENT]
   ↓
4. fe-code-optimizer (review implementation)
   ↓
5. [YOU FIX ISSUES]
   ↓
6. unit-test-writer (add test coverage)
   ↓
7. ux-component-reviewer (validate UX, if UI component)
```

For bugs:
```
1. orchestrator (analyze bug report)
   ↓
2. fe-code-optimizer (investigate root cause)
   ↓
3. [YOU IMPLEMENT FIX]
   ↓
4. unit-test-writer (add regression tests)
```

---

## 🐛 Troubleshooting

### "Agent not found"

**Problem**: `claude-code --agent orchestrator "..."` returns "Agent not found"

**Solution**:
```bash
# Check agent files are in the right location
ls ~/.config/claude-code/agents/

# Should show: orchestrator.md, feature-requirements-analyzer.md, etc.

# If missing, copy them:
cp *.md ~/.config/claude-code/agents/
```

### "Permission denied" for shell script

**Problem**: `./agent-workflow.sh: Permission denied`

**Solution**:
```bash
chmod +x agent-workflow.sh
```

### "claude-code: command not found"

**Problem**: Claude Code isn't installed or not in PATH

**Solution**:
1. Install Claude Code: https://docs.claude.com
2. Verify installation: `which claude-code`
3. Add to PATH if needed

### Agent gives generic responses

**Problem**: Agent doesn't seem to be using its specialized prompt

**Solution**:
- Ensure agent files have proper YAML frontmatter (name, description)
- Check agent files have `.md` extension
- Verify agent name matches exactly (case-sensitive)
- Try: `claude-code --list-agents` to confirm they're loaded

### Workflow feels confusing

**Problem**: Not sure which agent to use or when

**Solution**:
- **Always start with orchestrator** - it will tell you exactly which agents to use
- Follow the commands provided - don't improvise
- Read the "Next Steps" section in each agent output

---

## 📚 Additional Resources

- **Claude Code Documentation**: https://docs.claude.com
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **React Testing Library**: https://testing-library.com/react
- **Vitest Documentation**: https://vitest.dev/

---

## 🤝 Contributing

To improve agents or add new ones:

1. Create new agent `.md` file following the existing format
2. Add YAML frontmatter with `name`, `description`, `model`
3. Update orchestrator's "AVAILABLE AGENTS" section
4. Update this README with agent details
5. Test the workflow end-to-end

---

## 📝 Quick Reference Card

**Starting a new feature:**
```bash
./agent-workflow.sh start "Feature description"
```

**Fixing a bug:**
```bash
./agent-workflow.sh start "Bug description"
```

**Reviewing code:**
```bash
./agent-workflow.sh review "What to review"
```

**Writing tests:**
```bash
./agent-workflow.sh test "What to test"
```

**Checking UX:**
```bash
./agent-workflow.sh ux "Component name"
```

**Remember**: The orchestrator is your friend. Always start there! 🎯