import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AuthPanel from "@/components/auth-panel";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = (await searchParams) ?? {};
  const initialMode = params.mode === "signup" ? "signup" : "login";

  return <AuthPanel initialMode={initialMode} />;
}
