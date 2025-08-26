import { requireAdmin } from "@/lib/auth-helpers";
import NewAnnouncementForm from "./_form";

export default async function NewAnnouncement() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Create Announcement</h1>
      <NewAnnouncementForm />
    </div>
  );
}
