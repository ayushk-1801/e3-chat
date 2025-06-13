import { ChatBox } from "@/components/chat/chat-box";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-secondary-foreground mb-8 text-4xl font-bold dark:text-white">
          How can I help you, {session?.user?.name?.split(" ")[0] ?? "there"}?
        </h1>
      </div>
      <ChatBox />
    </div>
  );
}
