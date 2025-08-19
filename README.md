# Stack: Vibe Coding Platform 🚀

A professional, AI-powered coding platform that supports React, Next.js, Expo, and Node.js development. Build, deploy, and manage your projects with an integrated development environment featuring AI assistance, real-time collaboration, and web container technology.

## ✨ Features

### 🎯 **AI-Powered Development**

- **Intelligent Code Generation**: AI-assisted coding with context-aware suggestions
- **Natural Language to Code**: Describe your requirements in plain English
- **Smart File Management**: AI helps organize and structure your project files
- **Interactive Chat Interface**: Real-time AI assistance throughout development

### 🖥️ **Integrated Development Environment**

- **Monaco Editor**: Professional-grade code editor with syntax highlighting
- **File Explorer**: Hierarchical file tree with search capabilities
- **Terminal Integration**: Built-in terminal with xterm.js for command execution
- **Resizable Panels**: Customizable layout with drag-and-drop resizing

### 🌐 **Web Container Technology**

- **Live Preview**: Real-time web application preview with responsive modes
- **Containerized Execution**: Secure, isolated development environment
- **Hot Reload**: Instant updates as you code
- **Multi-device Testing**: Desktop, tablet, and mobile preview modes

### 🔐 **Authentication & Security**

- **Clerk Integration**: Secure user authentication and management
- **User Profiles**: Personalized development experience
- **Project Isolation**: Secure separation between user projects

### 📱 **Modern UI/UX**

- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Themes**: Toggle between themes for comfortable coding
- **Shadcn/ui Components**: Beautiful, accessible UI components
- **Framer Motion**: Smooth animations and transitions

## 🏗️ Architecture

### **Frontend Stack**

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### **Backend & Database**

- **tRPC**: End-to-end type-safe APIs
- **Prisma**: Modern database ORM
- **PostgreSQL**: Robust relational database
- **Next.js API Routes**: Server-side API endpoints

### **AI & LLM Integration**

- **AI SDK**: Google AI integration
- **Streaming Responses**: Real-time AI interactions
- **Context-Aware Prompts**: Intelligent project understanding

### **Development Tools**

- **WebContainer API**: Browser-based development environment
- **Monaco Editor**: VS Code-like editing experience
- **Xterm.js**: Terminal emulation
- **GitHub Integration**: Repository management and commits

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- PostgreSQL database
- GitHub account (for repository integration)

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/stack-vibe-coding-platform.git
   cd stack-vibe-coding-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:

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

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run postinstall

   # Run database migrations
   npm run migrate:dev

   # (Optional) Open Prisma Studio
   npm run studio
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## �� Project Structure

```
stack-vibe-coding-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (main)/            # Main application routes
│   │   │   └── ~/             # Dynamic project routes
│   │   │       ├── _components/ # Project-specific components
│   │   │       │   ├── CodeEditor.tsx      # Main editor interface
│   │   │       │   ├── FileExplorer.tsx    # File tree and search
│   │   │       │   ├── TerminalUI.tsx      # Integrated terminal
│   │   │       │   ├── WebPreview.tsx      # Live preview
│   │   │       │   └── ...                 # Other components
│   │   │       └── [id]/       # Dynamic project pages
│   │   └── api/                # API routes
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Shadcn/ui components
│   │   └── ai-elements/        # AI-specific components
│   ├── context/                # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── llm/                    # AI/LLM integration
│   ├── server/                 # tRPC server setup
│   └── utils/                  # Helper functions
├── prisma/                     # Database schema and migrations
├── public/                     # Static assets
└── package.json                # Dependencies and scripts
```

## 🎮 Usage

### **Creating a New Project**

1. Sign in to your account
2. Click "Create New Stack"
3. Describe your project requirements in natural language
4. AI will generate the initial project structure
5. Start coding with the integrated development environment

### **AI-Assisted Development**

1. Use the chat interface to ask questions
2. Request code generation for specific features
3. Get help with debugging and optimization
4. AI will understand your project context and provide relevant assistance

### **Live Development**

1. Write code in the Monaco editor
2. See real-time preview in the web container
3. Use the terminal for package management and commands
4. Test responsive design across different device modes

### **File Management**

1. Navigate files using the hierarchical explorer
2. Search for specific files or content
3. Organize your project structure
4. AI helps maintain clean file organization

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate:dev` - Run database migrations
- `npm run migrate:prd` - Deploy migrations to production
- `npm run studio` - Open Prisma Studio

## 🌟 Key Components

### **CodeEditor**

The main development interface featuring:

- Resizable panels for optimal workflow
- Monaco editor for professional coding experience
- File explorer for project navigation
- Integrated terminal for command execution

### **WebPreview**

Live preview system with:

- Real-time web application rendering
- Responsive design testing (desktop/tablet/mobile)
- WebContainer technology for secure execution
- Live reload capabilities

### **AI Integration**

Intelligent assistance through:

- Context-aware code generation
- Natural language project understanding
- Streaming AI responses
- Project-specific recommendations

### **File Management**

Comprehensive file handling:

- Hierarchical file tree
- Search and filtering capabilities
- AI-powered file organization
- Template-based project generation

## 🔒 Security Features

- **User Authentication**: Secure login with Clerk
- **Project Isolation**: Users can only access their own projects
- **WebContainer Security**: Isolated execution environment
- **Database Security**: Prisma with proper access controls

## 🚀 Deployment

### **Production Build**

```bash
npm run build
npm run start
```

### **Environment Variables**

Ensure all required environment variables are set in production:

- Database connection strings
- Authentication keys
- AI service credentials
- GitHub integration settings

### **Database Migration**

```bash
npm run migrate:prd
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub
- **AI Assistant**: Use the built-in AI chat for development help

## 🔮 Roadmap

- [ ] Enhanced AI capabilities with more LLM providers
- [ ] Real-time collaboration features
- [ ] Advanced project templates
- [ ] CI/CD integration
- [ ] Mobile app development
- [ ] Enterprise features and team management

---

**Built with ❤️ using Next.js, React, and modern web technologies**

_Stack: Vibe Coding Platform - Where AI meets development_
