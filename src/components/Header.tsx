import Link from "next/link";

import { isAuthenticated, signOut } from "@/lib/auth";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";

export default async function Header() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  const authenticated = await isAuthenticated();

  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="flex items-center justify-between py-4 px-4 border-b border-border md:px-8">
      <Link href="/" aria-label="go home">
        <Logo size={40} />
      </Link>
      {authenticated ? (
        <form action={signOut}>
          <Button type="submit" className="cursor-pointer">
            Sign out
          </Button>
        </form>
      ) : (
        <div></div>
      )}
    </header>
  );
}
