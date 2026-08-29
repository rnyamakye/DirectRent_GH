import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessagingApp } from "@/components/messaging/messaging-app";

export default async function RenterMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const resolvedSearchParams = await searchParams;
  const conversationId = resolvedSearchParams.conversationId as string | undefined;

  return (
    <main className="h-[100dvh] w-full">
      <MessagingApp currentUserId={user.id} initialConversationId={conversationId} />
    </main>
  );
}
