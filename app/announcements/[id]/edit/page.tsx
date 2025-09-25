// app/announcements/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { getUserPermissions } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import AnnouncementForm from "../../AnnoucementForm";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage(context: any) {
  const params = (await context).params
  const session = await requireUser();
  const userId = (session.user as any).id as string;

  const ann = await prisma.announcement.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, content: true, authorId: true },
  });
  if (!ann) return notFound();

  const perms = await getUserPermissions(userId);
  const canManage = perms.has(Permission.MANAGE_ANNOUNCEMENTS);
  const isAuthor = ann.authorId === userId;
  if (!(isAuthor || canManage)) return notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Edit announcement</h1>
      <AnnouncementForm announcementId={ann.id} initialTitle={ann.title} initialContent={ann.content ?? ""} />
    </div>
  );
}
