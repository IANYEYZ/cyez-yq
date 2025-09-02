import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function MeRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const id = (session.user as any).id; // we set this in your auth callbacks
  redirect(`/u/${id}`);
}
