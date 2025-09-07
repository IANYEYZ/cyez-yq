import { requireUser } from "@/lib/auth-helpers";
import NewThreadForm from "./_form";

export default async function NewThreadPage() {
  await requireUser(); // any signed-in student can create
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">发个讨论</h1>
      <NewThreadForm />
    </div>
  );
}
