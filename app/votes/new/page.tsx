import { requireUser } from "@/lib/auth-helpers";
import NewPollForm from "./NewPollForm";

export default async function NewPollPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">新建投票</h1>
      <NewPollForm />
    </div>
  );
}
