<<<<<<< HEAD
# ENACT - Legal Assistant Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

AI-powered legal assistant for Indian citizens. Understand your rights and navigate justice with clear, step-by-step guidance based on BNS, BSA, and BNSS 2023.

## 🚀 Features

- **AI Legal Chat**: Get instant legal advice powered by Google Gemini AI
- **Document Generation**: Generate FIR, Legal Notice, and RTI applications
- **Case Tracking**: Track your legal cases and documents
- **Legal Resources**: Access comprehensive legal information
- **News Updates**: Stay updated with latest legal news
- **Accessibility**: Full screen reader support and keyboard navigation
- **Responsive Design**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase Edge Functions (Deno)
- **AI**: Google Gemini API
- **Testing**: Vitest, Testing Library, MSW
- **Code Quality**: ESLint, Prettier, Husky
- **Performance**: React Query, Lazy Loading

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account
- Google Gemini API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd prod-perfect-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:run
```

## 🔍 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

## 🏗️ Building

```bash
# Build for production
npm run build

# Build for development
npm run build:dev

# Analyze bundle size
npm run build:analyze

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── chat/           # Chat-specific components
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility libraries
├── pages/              # Page components
├── test/               # Test utilities and mocks
└── utils/              # Helper functions

supabase/
├── functions/          # Edge Functions
│   ├── generate-document/
│   └── legal-chat/
└── migrations/         # Database migrations
```

## 🔐 Security

- Environment variables are validated at runtime
- Content Security Policy (CSP) headers implemented
- Input sanitization for user-generated content
- Secure API key management
- Error boundary with error reporting

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Screen reader support
- Keyboard navigation
- Focus management
- High contrast support
- Semantic HTML structure

## 📊 Performance

- Core Web Vitals monitoring
- Bundle size optimization
- Lazy loading for routes
- Image optimization
- Caching strategies

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Configure environment variables on your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_ANALYTICS_ID` | Analytics tracking ID | No |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | No |

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**
   - Run `npm run type-check` to see detailed errors
   - Ensure all dependencies are installed

2. **Environment variables not working**
   - Check that variables start with `VITE_`
   - Restart development server after changes

3. **Supabase connection issues**
   - Verify your Supabase credentials
   - Check network connectivity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Lovable](https://lovable.dev/) for the initial project setup

## 📞 Support

For support, email support@enact-legal.com or create an issue in this repository.
=======
# Enact
>>>>>>> 83ae1b88c432808be8f96f4a0b399f99b88e0139
