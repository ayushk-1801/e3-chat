import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL as string,
  },
);

export const { signIn, signOut, useSession } = authClient;