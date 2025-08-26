import { requireUser } from "@/lib/auth-helpers";
import NewConfessionForm from "./_form";

export default async function NewConfession() {
  await requireUser();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Submit a confession</h1>
      <p className="mb-4 text-sm text-gray-600">
        Your submission is anonymous to other students. Admins can review and moderate.
      </p>
      <NewConfessionForm />
    </div>
  );
}
