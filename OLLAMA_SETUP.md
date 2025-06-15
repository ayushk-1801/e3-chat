# Ollama Setup and Usage

This document explains how to set up and use Ollama with your chat interface.

## Prerequisites

1. **Install Ollama**: Download and install from [https://ollama.ai](https://ollama.ai)
2. **Start Ollama Service**: Ensure Ollama is running locally (usually on `http://localhost:11434`)

## Available Models

The chat interface supports the following Ollama models:

### Meta Llama Models
- `llama3.2` - Latest Llama 3.2 model
- `llama3.2:3b` - Llama 3.2 3B (smaller, faster)
- `llama3.1` - Latest Llama 3.1 model
- `llama3.1:8b` - Llama 3.1 8B
- `llama3.1:70b` - Llama 3.1 70B (requires significant resources)

### Microsoft Phi Models
- `phi3` - Latest Phi-3 model
- `phi3:3.8b` - Phi-3 3.8B
- `phi3:14b` - Phi-3 14B

### Code Generation Models
- `codellama` - Latest CodeLlama model
- `codellama:7b` - CodeLlama 7B
- `codellama:13b` - CodeLlama 13B
- `deepseek-coder` - DeepSeek Coder (latest)
- `deepseek-coder:6.7b` - DeepSeek Coder 6.7B

### Other Models
- `mistral` - Latest Mistral model
- `mistral:7b` - Mistral 7B
- `gemma2` - Latest Gemma 2 model
- `gemma2:2b` - Gemma 2 2B
- `gemma2:9b` - Gemma 2 9B
- `qwen2.5` - Latest Qwen 2.5 model
- `qwen2.5:7b` - Qwen 2.5 7B
- `qwen2.5:14b` - Qwen 2.5 14B

## Setup Instructions

### 1. Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### 2. Start Ollama Service
```bash
ollama serve
```

### 3. Pull Models
Pull the models you want to use:
```bash
# Example: Pull Llama 3.2 3B model
ollama pull llama3.2:3b

# Example: Pull Phi-3 model
ollama pull phi3

# Example: Pull CodeLlama for code generation
ollama pull codellama:7b
```

### 4. Verify Installation
Check that Ollama is running and models are available:
```bash
ollama list
```

## Usage

1. Start your chat application
2. In the model selector, choose "Ollama (Local)" section
3. Select any of the available Ollama models
4. Start chatting with your local models!

## Configuration

### Custom Ollama URL
If your Ollama instance is running on a different host/port, you can configure it by modifying the `ollama-ai-provider` import in `src/app/api/chat/route.ts`:

```typescript
import { createOllama } from 'ollama-ai-provider';

const ollama = createOllama({
  baseURL: 'http://your-ollama-host:11434',
});
```

### Performance Tips

1. **Model Size**: Smaller models (3B, 7B) are faster but less capable
2. **RAM Usage**: Larger models require more RAM (70B models need 40GB+ RAM)
3. **GPU Acceleration**: Ollama automatically uses GPU if available
4. **Concurrent Requests**: Ollama can handle multiple requests but performance depends on hardware

## Troubleshooting

### Model Not Found
If you get a "model not found" error:
1. Check that Ollama is running: `ollama list`
2. Pull the model: `ollama pull <model-name>`
3. Restart your chat application

### Connection Issues
If the chat interface can't connect to Ollama:
1. Verify Ollama is running: `curl http://localhost:11434/api/version`
2. Check firewall settings
3. Ensure no other service is using port 11434

### Performance Issues
If models are slow:
1. Use smaller models for faster responses
2. Close other resource-intensive applications
3. Consider using GPU acceleration
4. Check available RAM and CPU usage

## Adding New Models

To add support for new Ollama models:

1. Add the model to the `getModelProvider` function in `src/app/api/chat/route.ts`
2. Add the model display name to `modelDisplayNames` in `src/components/chat/chat-interface.tsx`
3. Add a SelectItem for the model in the Ollama section

Example:
```typescript
// In route.ts
case 'new-model':
  return ollama('new-model');

// In chat-interface.tsx
"new-model": "New Model Name",

// Add SelectItem in the Ollama SelectGroup
<SelectItem value="new-model" className="flex items-center gap-3 px-3 py-2.5">
  ...
</SelectItem>
``` 