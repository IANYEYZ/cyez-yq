// app/dashboard/page.tsx
import { auth } from "@/auth";
import { luckFor } from "@/lib/luck";

export default async function Dashboard() {
  const session = await auth();
  const userId = (session?.user as any)?.id!;
  const luck = luckFor(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <LuckCard luck={luck} />
        <Card title="Announcements"><p>Latest updates from instructors.</p></Card>
        <Card title="Assignments"><p>Upcoming due dates at a glance.</p></Card>
      </div>

      <p className="text-sm text-gray-600">Signed in as {session?.user?.email}</p>
    </div>
  );
}

function LuckCard({ luck }: { luck: ReturnType<typeof luckFor> }) {
  return (
    <div className="rounded border p-4">
      <h2 className="mb-2 font-medium">Today&apos;s Luck {luck.emoji}</h2>
      <div className="text-3xl font-bold">{luck.score}</div>
      <p className="text-sm text-gray-600">{luck.tier} • {luck.day}</p>
      <p className="mt-3 text-sm">Lucky number: <span className="font-medium">{luck.luckyNumber}</span></p>
      <p className="text-sm">Lucky color: <span className="font-medium">{luck.luckyColor}</span></p>
      <p className="mt-3 text-sm text-gray-700">{luck.blurb}</p>
      <p className="mt-3 text-xs text-gray-500">seed: {luck.seed}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border p-4">
      <h2 className="mb-2 font-medium">{title}</h2>
      {children}
    </div>
  );
}
