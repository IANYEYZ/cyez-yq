import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import EnrollmentGeneratorClient from "./EnrollmentGeneratorClient";

export const dynamic = "force-dynamic";

export default async function EnrollmentAdminPage() {
  await requirePermission(Permission.MANAGE_ENROLLMENT);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">邀请码</h1>
      <p className="text-sm text-gray-600">
        粘贴包含 <code>email,name</code> 的 CSV。 每一行生成一个一次性邀请码
      </p>
      <EnrollmentGeneratorClient />
    </div>
  );
}
