import { ChatBox } from "@/components/chat/chat-box";

export default function ChatPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="mb-8 text-4xl font-bold text-secondary-foreground dark:text-white">
          How can I help you, Ayush?
        </h1>
      </div>
      <ChatBox />
    </div>
  );
}
