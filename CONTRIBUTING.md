# Contributing to Stack: Vibe Coding Platform 🚀

Thank you for your interest in contributing to Stack: Vibe Coding Platform! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful, inclusive, and constructive in all interactions.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome contributors from all backgrounds and experience levels
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone is learning and growing

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** installed
- **PostgreSQL** database running
- **Git** for version control
- **GitHub account** for repository access
- Basic knowledge of **React**, **Next.js**, and **TypeScript**

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/lwshakib/stack-vibe-coding-platform.git
   cd stack-vibe-coding-platform
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/lwshakib/stack-vibe-coding-platform.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stack_vibe_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI Services
GOOGLE_AI_API_KEY=your_google_ai_key

# GitHub Integration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run postinstall

# Run database migrations
npm run migrate:dev

# (Optional) Open Prisma Studio
npm run studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📝 Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Fixes**: Fix existing issues and improve stability
- **✨ New Features**: Add new functionality to the platform
- **📚 Documentation**: Improve README, code comments, and guides
- **🎨 UI/UX Improvements**: Enhance the user interface and experience
- **⚡ Performance**: Optimize code and improve application performance
- **🧪 Testing**: Add or improve test coverage
- **🔧 Tooling**: Improve development tools and workflows

### Code Style Guidelines

#### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **meaningful variable and function names**
- Add **JSDoc comments** for complex functions
- Prefer **functional components** with hooks
- Use **const** and **let** appropriately (avoid `var`)

#### React/Next.js

- Use **React 19** features and patterns
- Follow **Next.js App Router** conventions
- Use **Server Components** when appropriate
- Implement **proper error boundaries**
- Use **custom hooks** for reusable logic

#### Styling

- Use **Tailwind CSS** for styling
- Follow **mobile-first** responsive design
- Use **CSS variables** for theming
- Implement **dark/light mode** support
- Follow **accessibility** guidelines (WCAG 2.1)

#### Database

- Use **Prisma** for all database operations
- Create **migrations** for schema changes
- Use **proper indexing** for performance
- Follow **data validation** with Zod schemas

### File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Main application routes
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   └── ai-elements/      # AI-specific components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── llm/                  # AI/LLM integration
├── server/               # tRPC server setup
└── utils/                # Helper functions
```

## 🔄 Pull Request Process

### Before Submitting

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly

4. **Update documentation** if needed

5. **Commit your changes** with clear messages:

   ```bash
   git add .
   git commit -m "feat: add new AI chat feature"
   ```

### Commit Message Format

Use conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Template

When creating a PR, include:

- **Clear title** describing the change
- **Description** of what was changed and why
- **Screenshots** for UI changes
- **Testing instructions**
- **Related issues** (use "Fixes #123")

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by maintainers
3. **Testing** by the team
4. **Approval** and merge

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** and README
3. **Try to reproduce** the issue

### Bug Reports

Include the following information:

- **Clear title** describing the bug
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** or error messages
- **Environment details** (OS, browser, Node.js version)
- **Console logs** if applicable

### Feature Requests

Include:

- **Clear description** of the feature
- **Use case** and motivation
- **Proposed solution** or approach
- **Alternative solutions** considered
- **Additional context** or examples

## 🔄 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Workflow Steps

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch**:

   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes** and commit

4. **Push to your fork**:

   ```bash
   git push origin feature/your-feature
   ```

5. **Create pull request**

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write **unit tests** for utility functions
- Write **integration tests** for API routes
- Write **component tests** for React components
- Aim for **80%+ code coverage**
- Use **descriptive test names**

### Test Structure

```typescript
describe("ComponentName", () => {
  it("should render correctly", () => {
    // Test implementation
  });

  it("should handle user interactions", () => {
    // Test implementation
  });
});
```

## 📚 Documentation

### Code Documentation

- Add **JSDoc comments** for functions and classes
- Include **parameter descriptions** and return types
- Add **usage examples** for complex functions
- Document **API endpoints** with examples

### README Updates

- Keep **installation instructions** up to date
- Update **feature lists** when adding new functionality
- Include **screenshots** for UI changes
- Update **environment variables** section

### API Documentation

- Document **tRPC procedures** with examples
- Include **request/response schemas**
- Add **error handling** documentation
- Provide **authentication** requirements

## 🌟 Community

### Getting Help

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord/Slack** - Real-time community chat (if available)
- **Documentation** - Check README and inline comments

### Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** file
- **Release notes** for significant contributions
- **GitHub contributors** page
- **Community highlights** in discussions

### Mentorship

- **New contributors** can request mentorship
- **Experienced contributors** can volunteer to mentor
- **Pair programming** sessions for complex features
- **Code review** feedback and guidance

## 🎯 Areas for Contribution

### High Priority

- **AI Integration Improvements** - Enhance LLM capabilities
- **Performance Optimization** - Improve loading times and responsiveness
- **Accessibility** - Ensure WCAG 2.1 compliance
- **Testing Coverage** - Increase test coverage
- **Documentation** - Improve guides and examples

### Medium Priority

- **UI/UX Enhancements** - Improve user experience
- **New Features** - Add requested functionality
- **Bug Fixes** - Resolve existing issues
- **Code Refactoring** - Improve code quality
- **Tooling** - Enhance development experience

### Low Priority

- **Code Style** - Minor formatting improvements
- **Documentation** - Typos and clarifications
- **Dependencies** - Update packages
- **Configuration** - Minor config improvements

## 📞 Contact

- **Maintainers**: [List maintainer contacts]
- **Discord**: [Community server link]
- **Email**: [Contact email]
- **Twitter**: [Social media handle]

## 🙏 Thank You

Thank you for contributing to Stack: Vibe Coding Platform! Your contributions help make this project better for everyone in the developer community.

---

**Happy Coding! 🚀**

_Stack: Vibe Coding Platform - Where AI meets development_
