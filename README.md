# E3 Chat

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app` with [Better Auth](https://github.com/better-auth/better-auth) integration for social authentication.

## Features

- **Authentication**: Social login with Google, GitHub, and Discord using Better Auth
- **AI Chat**: Multiple AI providers for diverse model selection
  - **Google Gemini**: Latest models with search grounding capabilities
  - **Groq**: Ultra-fast inference with Llama, Mixtral, and other models
  - **Ollama**: Run models locally for privacy and offline usage
- **Search Grounding**: Real-time web search integration (Gemini models only)
- **Multiple AI Models**: Choose from 25+ models across different providers
  - Google Gemini 2.5 Pro/Flash, Gemini 2.0 Flash
  - Meta Llama 4 Scout, Llama 3.3 70B, Llama 3.1 variants
  - Mixtral 8x7B, Mistral models
  - Microsoft Phi-3 models
  - Qwen, DeepSeek, and specialized code models
- **Local AI Models**: Privacy-focused local inference with Ollama
  - Llama 3.2/3.1 (3B, 8B, 70B variants)
  - CodeLlama for code generation
  - Phi-3, Mistral, Gemma 2, Qwen 2.5
  - DeepSeek Coder for advanced coding tasks
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Beautiful components using shadcn/ui
- **Type Safety**: Full-stack TypeScript

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# Auth
BETTER_AUTH_SECRET="your-better-auth-secret-here"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# AI Providers
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"
GROQ_API_KEY="your-groq-api-key"
```

## Authentication Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run docker:up
npm run db:push
```

3. Start the development server:
```bash
npm run dev
```

4. (Optional) Set up Ollama for local models:
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull some models (examples)
ollama pull llama3.2:3b
ollama pull phi3
ollama pull codellama:7b
```

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
