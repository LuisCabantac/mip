import Link from "next/link";
import { Metadata } from "next";

import { signIn } from "@/lib/actions/authActions";

import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to mIP.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="flex min-h-screen px-4 py-16 md:py-32">
      <form
        action={signIn}
        className="m-auto h-fit w-full max-w-sm overflow-hidden"
      >
        {params.redirect && (
          <input type="hidden" name="redirect" value={params.redirect} />
        )}

        <div className="-m-px p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <Logo size={40} />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to mIP</h1>
            <p className="text-sm">Welcome back! Sign in to continue</p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Username
              </Label>
              <Input type="email" required name="email" id="email" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
              </div>
              <Input
                type="password"
                required
                name="password"
                id="password"
                className="input sz-md variant-mixed"
              />
            </div>

            <Button className="w-full">Sign In</Button>
          </div>
        </div>
      </form>
    </section>
  );
}
