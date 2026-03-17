import { redirect } from "next/navigation";
import { SignalHunterDashboard } from "@/components/signal-hunter-dashboard";

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const code = getSingleValue(resolvedSearchParams.code);
  const authError = getSingleValue(resolvedSearchParams.authError);

  if (code) {
    const callbackParams = new URLSearchParams();
    callbackParams.set("code", code);
    callbackParams.set("next", "/");

    if (authError) {
      callbackParams.set("authError", authError);
    }

    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  return <SignalHunterDashboard />;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
