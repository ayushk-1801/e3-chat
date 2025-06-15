# Search Grounding with Gemini Models

This document explains the search grounding functionality implemented for Gemini models in the e3-chat application.

## Overview

Search grounding allows Gemini models to access real-time information from the web to provide more accurate and up-to-date responses. This feature is implemented using the Vercel AI SDK's Google provider with the `useSearchGrounding` option.

## Implementation Details

### Backend Changes (`src/app/api/chat/route.ts`)

1. **Updated Request Interface**: Added `useSearchGrounding` parameter to the request body
2. **Enhanced Model Provider**: Modified `getModelProvider` function to accept search grounding options
3. **Gemini Model Configuration**: All Gemini models now support search grounding when enabled

```typescript
interface RequestBody {
  messages: ChatMessage[];
  chatId?: string;
  selectedModel?: string;
  useSearchGrounding?: boolean;
}

const getModelProvider = (modelId: string, useSearchGrounding = false) => {
  const searchOptions = useSearchGrounding ? { useSearchGrounding: true } : {};
  // ... model configuration with searchOptions
};
```

### Frontend Changes (`src/components/chat/chat-interface.tsx`)

1. **Search State Management**: Added `useSearchGrounding` state variable
2. **UI Indicator**: Visual feedback when search grounding is enabled
3. **Toggle Button**: Interactive search button that enables/disables grounding
4. **Model Restriction**: Search grounding only available for Gemini models

## Features

### Visual Indicators

- **Search Button**: Shows "Search" when disabled, "Search On" when enabled
- **Visual Feedback**: Button changes color when search grounding is active
- **Notification Banner**: Displays when search grounding is enabled
- **Toast Messages**: Confirms when search grounding is toggled

### Model Support

Search grounding is supported for the following Gemini models:
- `gemini-2.5-pro-preview-05-06`
- `gemini-2.5-flash-preview-04-17`
- `gemini-2.5-pro-exp-03-25`
- `gemini-2.0-flash`

### Automatic Features

- **Model-Based Enabling**: Only available when a Gemini model is selected
- **Auto-Disable**: Automatically disables when switching to non-Gemini models
- **System Prompt Enhancement**: Updated system prompt to encourage source citation

## Usage

1. **Select a Gemini Model**: Choose any Gemini model from the dropdown
2. **Enable Search Grounding**: Click the "Search" button to enable
3. **Visual Confirmation**: The button will show "Search On" and display a notification
4. **Ask Questions**: Ask questions that benefit from current information
5. **Real-time Results**: The model will search the web and provide grounded responses

## Technical Implementation

The search grounding feature utilizes:

- **Vercel AI SDK**: `@ai-sdk/google` provider with `useSearchGrounding: true`
- **Google's Search API**: Integrated through Gemini models
- **Real-time Processing**: Web search happens during text generation
- **Streaming Support**: Compatible with streaming text responses

## Benefits

- **Current Information**: Access to up-to-date web content
- **Improved Accuracy**: Responses grounded in real data
- **Source Attribution**: Responses can reference specific sources
- **Better Context**: Enhanced understanding of current events and recent developments

## Future Enhancements

- **Source Display**: Show sources used for grounding (requires UI extension)
- **Search Configuration**: Advanced search parameters and filters
- **Cache Management**: Optimize search result caching
- **Citation Formatting**: Better source citation in responses 