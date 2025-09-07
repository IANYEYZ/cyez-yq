// app/announcements/new/page.tsx
import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import NewAnnouncementForm from "./_form";

export default async function NewAnnouncement() {
  await requirePermission(Permission.MANAGE_ANNOUNCEMENTS);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">创建公告</h1>
      <NewAnnouncementForm />
    </div>
  );
}
