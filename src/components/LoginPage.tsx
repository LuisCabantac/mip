"use client";

import z from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { signInSchema } from "@/lib/schema";
import { signIn } from "@/lib/actions/authActions";

import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function LoginPage({
  redirect,
}: {
  redirect: string | undefined;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      redirect,
    },
  });

  const isFormValid =
    form.watch("email") &&
    form.watch("password") &&
    Object.keys(form.formState.errors).length === 0;

  async function handleSignIn(values: z.infer<typeof signInSchema>) {
    try {
      setIsLoading(true);
      const response = await signIn(values);
      if (response.error) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      router.push(values.redirect || "/");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-screen px-4 py-16 md:py-32">
      <form
        className="m-auto h-fit w-full max-w-sm overflow-hidden"
        onSubmit={form.handleSubmit(handleSignIn)}
      >
        <FieldGroup>
          {redirect && (
            <Controller
              control={form.control}
              name="redirect"
              disabled={isLoading}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    id="redirect"
                    type="hidden"
                    disabled={field.disabled}
                    {...field}
                  />
                </Field>
              )}
            />
          )}
          <div className="-m-px p-8 pb-6">
            <div className="text-center">
              <Link
                href="/"
                aria-label="go home"
                className="mx-auto block w-fit"
              >
                <Logo size={40} />
              </Link>
              <h1 className="mb-1 mt-4 text-xl font-semibold">
                Sign In to mIP
              </h1>
              <p className="text-sm">Welcome back! Sign in to continue</p>
            </div>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="email"
                  disabled={isLoading}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email" className="block text-sm">
                        Email
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        disabled={field.disabled}
                        {...field}
                      />
                    </Field>
                  )}
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <Controller
                    control={form.control}
                    name="password"
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="password"
                          className="block text-sm"
                        >
                          Password
                        </FieldLabel>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          required
                          disabled={field.disabled}
                          className="input sz-md variant-mixed"
                          {...field}
                        />
                      </Field>
                    )}
                  />
                </div>
              </div>
              <Button
                className="w-full cursor-pointer"
                type="submit"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? <Spinner /> : "Sign In"}
              </Button>
            </div>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}
