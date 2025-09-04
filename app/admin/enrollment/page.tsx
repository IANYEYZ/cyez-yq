import { requirePermission } from "@/lib/permissions";
import { Permission } from "@prisma/client";
import EnrollmentGeneratorClient from "./EnrollmentGeneratorClient";

export const dynamic = "force-dynamic";

export default async function EnrollmentAdminPage() {
  await requirePermission(Permission.MANAGE_ENROLLMENT);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Enrollment Codes</h1>
      <p className="text-sm text-gray-600">
        Paste CSV with <code>email,name</code> (first line can be a header). Each row gets a fresh one-time code.
      </p>
      <EnrollmentGeneratorClient />
    </div>
  );
}
