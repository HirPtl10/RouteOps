"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Live validation
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    console.log("Login data:", data);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="block text-left text-sm font-medium text-slate-700"
        >
          Email address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            className={cn(
              "block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              form.formState.errors.email &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            )}
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-left text-sm font-medium text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-left text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <a
            href="#"
            className="text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className={cn(
              "block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              form.formState.errors.password &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            )}
            {...form.register("password")}
          />
        </div>
        {form.formState.errors.password && (
          <p className="text-left text-sm font-medium text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange", // Live validation
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    console.log("Sign up data:", data);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5 animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="space-y-2">
        <label
          htmlFor="signup-name"
          className="block text-left text-sm font-medium text-slate-700"
        >
          Full Name
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="signup-name"
            type="text"
            placeholder="John Doe"
            disabled={isLoading}
            className={cn(
              "block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              form.formState.errors.name &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            )}
            {...form.register("name")}
          />
        </div>
        {form.formState.errors.name && (
          <p className="text-left text-sm font-medium text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="signup-email"
          className="block text-left text-sm font-medium text-slate-700"
        >
          Email address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="signup-email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            className={cn(
              "block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              form.formState.errors.email &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            )}
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-left text-sm font-medium text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="signup-password"
          className="block text-left text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className={cn(
              "block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              form.formState.errors.password &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/10"
            )}
            {...form.register("password")}
          />
        </div>
        {form.formState.errors.password && (
          <p className="text-left text-sm font-medium text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]" />

      <div className="relative w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isLogin
              ? "Sign in to your account to continue"
              : "Enter your details to get started"}
          </p>
        </div>

        <div className="mb-6 flex space-x-1 rounded-xl border border-slate-200/60 bg-slate-100/80 p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={cn(
              "w-full rounded-lg py-2 text-sm font-medium transition-all duration-200",
              isLogin
                ? "border border-slate-200/50 bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Sign in
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cn(
              "w-full rounded-lg py-2 text-sm font-medium transition-all duration-200",
              !isLogin
                ? "border border-slate-200/50 bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            Sign up
          </button>
        </div>

        {isLogin ? <LoginForm /> : <SignUpForm />}
      </div>
    </main>
  );
}
