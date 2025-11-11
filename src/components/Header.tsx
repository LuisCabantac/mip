"use client";

import Link from "next/link";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function Header({
  isAuthenticated,
  onSignOut,
}: {
  isAuthenticated: boolean;
  onSignOut: () => Promise<{
    success: boolean;
    message: string;
  }>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  async function handleSignOut() {
    const response = await onSignOut();
    if (response.success) {
      toast.success(response.message);
      router.push("/login");
    }
  }

  return (
    <header className="flex items-center justify-between py-4 px-4 border-b border-border md:px-8">
      <Link href="/" aria-label="go home">
        <Logo size={40} />
      </Link>
      {isAuthenticated ? (
        <Button onClick={handleSignOut} className="cursor-pointer">
          Sign out
        </Button>
      ) : (
        <div></div>
      )}
    </header>
  );
}
