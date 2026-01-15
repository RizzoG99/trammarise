# Contributing to Trammarise

Thank you for your interest in contributing to Trammarise! This document provides guidelines and instructions for contributing to the project.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/trammarise.git
   cd trammarise
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### Branch Naming Conventions

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-export-formats`)
- `fix/` - Bug fixes (e.g., `fix/audio-playback-issue`)
- `refactor/` - Code refactoring (e.g., `refactor/api-client`)
- `test/` - Test additions/improvements (e.g., `test/add-e2e-tests`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code standards (see below)

3. **Write tests** for new functionality:
   ```bash
   npm test YourComponent.test.tsx
   ```

4. **Run linter**:
   ```bash
   npm run lint
   ```

5. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new audio export format"
   git commit -m "fix: resolve playback issue on Safari"
   git commit -m "docs: update API documentation"
   ```

6. **Push to your fork**:
   ```bash
   git push -u origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

## 📝 Code Standards

### TypeScript

- Use **strict TypeScript** - no `any` types
- Define proper interfaces and types in `src/types/`
- Use type inference where appropriate
- Document complex types with JSDoc comments

### React Components

- Use **functional components** with hooks
- Follow the **component creation workflow** (see CLAUDE.md)
- Write **Storybook stories** for UI components
- Ensure **accessibility** (ARIA labels, keyboard navigation)
- Support **dark mode** with Tailwind's `dark:` classes

### Testing

- Write tests for **all new features**
- Use **React Testing Library** for component tests
- Prefer `getByRole` and `getByLabelText` over `getByTestId`
- Test **edge cases** and **error states**
- Aim for **80%+ code coverage**

### Styling

- Use **Tailwind CSS** for styling
- Follow existing design patterns (GlassCard, purple accent #8B5CF6)
- Ensure **responsive design** (mobile-first approach)
- Use CSS variables from `index.css` for theming

### File Organization

```
src/
├── lib/components/       # Reusable component library
│   ├── ui/              # UI components (Button, Modal, etc.)
│   ├── form/            # Form components (Input, Select, etc.)
│   ├── audio/           # Audio components (WaveformPlayer, etc.)
│   └── chat/            # Chat components
├── features/            # Feature-specific components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── app/                 # App routes and layout
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test ComponentName.test.tsx

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<YourComponent />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<YourComponent onClick={handleClick} />);
      
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<YourComponent />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
```

## 🎨 Component Creation Workflow

When creating new UI components:

1. **Functional Analysis** - Document requirements, props, states, interactions
2. **Write Tests** (TDD) - Create `ComponentName.test.tsx` first
3. **Implement Component** - Build to pass tests
4. **Create Storybook Story** - Add `ComponentName.stories.tsx`
5. **Verify Against Mockups** - Check design consistency
6. **Run Quality Checks** - Tests, linting, build

See `CLAUDE.md` for detailed component creation guidelines.

## 🔍 Code Review Process

All contributions require code review before merging:

1. **Self-review** your changes before requesting review
2. **Ensure CI passes** (tests, linting, build)
3. **Respond to feedback** promptly and professionally
4. **Update your PR** based on review comments
5. **Squash commits** before merge (maintainers will handle this)

### What Reviewers Look For

- ✅ Code follows project standards
- ✅ Tests cover new functionality
- ✅ No breaking changes (or properly documented)
- ✅ Accessibility considerations
- ✅ Performance implications
- ✅ Security considerations (especially for API keys)

## 🐛 Reporting Bugs

Use the **Bug Report** issue template and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment (browser, OS, version)
- Screenshots (if applicable)

## 💡 Suggesting Features

Use the **Feature Request** issue template and include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (if you have ideas)
- Alternative solutions considered

## 🔒 Security

**Do not** report security vulnerabilities in public issues. Instead, see our [Security Policy](SECURITY.md) for responsible disclosure.

## 📚 Additional Resources

- [CLAUDE.md](CLAUDE.md) - AI assistant guidelines and architecture docs
- [README.md](README.md) - Project overview and setup
- [docs/](docs/) - Developer documentation
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vitest Documentation](https://vitest.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## ❓ Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues/PRs
3. Ask in a new GitHub Discussion
4. Reach out to maintainers

## 📜 License

By contributing to Trammarise, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Trammarise! 🎉
