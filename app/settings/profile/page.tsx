import { requireUser } from "@/lib/auth-helpers";
import ProfileForm from "./_form";

export default async function ProfileSettings() {
  const session = await requireUser();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">个人资料</h1>
      <ProfileForm defaultEmail={session.user.email ?? ""} defaultRole={(session.user as any).role ?? "STUDENT"} />
    </div>
  );
}
