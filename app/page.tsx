import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect("/quiz");
}
