import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { SupportThread } from "@/components/support/support-thread";
import { getConversation } from "@/lib/server/repo";
import { getUser } from "@/lib/server/session";

export default async function SupportConversationPage({ params }: PageProps<"/settings/support/[id]">) {
  const { id } = await params;
  const user = await getUser();
  if (!user || !/^[A-Za-z0-9]{10,40}$/.test(id)) notFound();
  const conversation = await getConversation(id);
  // Another user's conversation is indistinguishable from a missing one.
  if (!conversation || conversation.user_id !== user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/settings/support" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden />
        All conversations
      </Link>
      <h1 className="display text-4xl break-words">{conversation.subject}</h1>
      <Card>
        <CardBody>
          <SupportThread conversation={conversation} asStaff={false} />
        </CardBody>
      </Card>
    </div>
  );
}
