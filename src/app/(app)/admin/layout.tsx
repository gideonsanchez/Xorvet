import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/server/repo";
import { getUser } from "@/lib/server/session";

// Server-side role check. Every admin API route checks again independently.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await getUser();
  if (!user || !(await isAdmin(user.id))) notFound();
  return children;
}
