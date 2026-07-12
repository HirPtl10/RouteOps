"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, LockKeyhole, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required."),
  name: z.string().min(2, "Your name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export default function AuthPanel({ initialMode }: { initialMode: "login" | "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [authMessage, setAuthMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { organizationName: "", name: "", email: "", password: "" },
  });

  const authCopy = useMemo(
    () =>
      mode === "login"
        ? {
            heading: "Welcome back",
            description: "Sign in to load your live organization data.",
            badge: "Login",
          }
        : {
            heading: "Create your account",
            description: "Set up a fleet organization and start saving records to the database.",
            badge: "Signup",
          },
    [mode],
  );

  const onLogin = async (values: LoginValues) => {
    setLoading(true);
    setAuthMessage("");
    setSuccessMessage("");

    const response = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setLoading(false);

    if (response?.error) {
      setAuthMessage("Invalid email or password.");
      return;
    }

    setSuccessMessage("Signed in successfully.");
    router.push("/dashboard");
    router.refresh();
  };

  const onSignup = async (values: SignupValues) => {
    setLoading(true);
    setAuthMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Could not create your account.");
      }

      const signInResponse = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResponse?.error) {
        throw new Error("Account created, but sign in failed. Please try logging in.");
      }

      setSuccessMessage("Account created and signed in.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "56rem", margin: "0 auto", minHeight: "100vh", display: "flex", alignItems: "center", padding: "2rem 1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)", gap: "1.5rem", width: "100%" }}>
        <Card>
          <CardHeader>
            <Badge variant="outline" style={{ width: "fit-content" }}>
              {authCopy.badge}
            </Badge>
            <CardTitle style={{ fontSize: "1.8rem", lineHeight: 1.1 }}>{authCopy.heading}</CardTitle>
            <CardDescription style={{ fontSize: "1rem", lineHeight: 1.7, color: "#475569" }}>
              {authCopy.description}
            </CardDescription>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: "1rem" }}>
            {authMessage ? (
              <div style={{ display: "flex", gap: "0.75rem", padding: "1rem", borderRadius: "1rem", border: "1px solid #fecaca", background: "#fff1f2", color: "#9f1239" }}>
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}>{authMessage}</p>
              </div>
            ) : null}
            {successMessage ? (
              <div style={{ display: "flex", gap: "0.75rem", padding: "1rem", borderRadius: "1rem", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534" }}>
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}>{successMessage}</p>
              </div>
            ) : null}

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <Button
                type="button"
                variant={mode === "login" ? "primary" : "outline"}
                onClick={() => setMode("login")}
              >
                <LockKeyhole className="h-4 w-4" />
                Login
              </Button>
              <Button
                type="button"
                variant={mode === "signup" ? "primary" : "outline"}
                onClick={() => setMode("signup")}
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "Sign in" : "Create account"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Use your existing email and password."
                : "Create an organization and your first manager account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLogin)} style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" autoComplete="email" disabled={loading} {...loginForm.register("email")} />
                  {loginForm.formState.errors.email ? <p style={{ margin: 0, color: "#dc2626", fontSize: "0.8rem" }}>{loginForm.formState.errors.email.message}</p> : null}
                </div>

                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" autoComplete="current-password" disabled={loading} {...loginForm.register("password")} />
                  {loginForm.formState.errors.password ? <p style={{ margin: 0, color: "#dc2626", fontSize: "0.8rem" }}>{loginForm.formState.errors.password.message}</p> : null}
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(onSignup)} style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <Label htmlFor="signup-org">Organization name</Label>
                  <Input id="signup-org" disabled={loading} {...signupForm.register("organizationName")} />
                  {signupForm.formState.errors.organizationName ? <p style={{ margin: 0, color: "#dc2626", fontSize: "0.8rem" }}>{signupForm.formState.errors.organizationName.message}</p> : null}
                </div>

                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <Label htmlFor="signup-name">Your name</Label>
                  <Input id="signup-name" disabled={loading} {...signupForm.register("name")} />
                  {signupForm.formState.errors.name ? <p style={{ margin: 0, color: "#dc2626", fontSize: "0.8rem" }}>{signupForm.formState.errors.name.message}</p> : null}
                </div>

                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" autoComplete="email" disabled={loading} {...signupForm.register("email")} />
                  {signupForm.formState.errors.email ? <p style={{ margin: 0, color: "#dc2626", fontSize: "0.8rem" }}>{signupForm.formState.errors.email.message}</p> : null}
                </div>

                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" autoComplete="new-password" disabled={loading} {...signupForm.register("password")} />
                  {signupForm.formState.errors.password ? <p style={{ margin: 0, color: "#dc2626", fontSize: "0.8rem" }}>{signupForm.formState.errors.password.message}</p> : null}
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
