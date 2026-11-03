import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="theme-light flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <LogoMark className="size-12" />
      <h1 className="display mt-6 text-5xl">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted">The page you are looking for does not exist or you do not have access to it.</p>
      <Button asChild className="mt-6">
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}
