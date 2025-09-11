"use client";

export default function VoteButtons({
  pollId, optionId, chosen,
}: { pollId: string; optionId: string; chosen: boolean }) {
  async function vote() {
    const r = await fetch(`/api/votes/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    if (!r.ok) {
      const j = await r.json().catch(()=>({}));
      alert(j?.error ?? "投票失败");
      return;
    }
    window.location.reload();
  }
  return (
    <button
      onClick={vote}
      className={`rounded border px-2 py-1 text-xs ${chosen ? "bg-black text-white" : "hover:bg-gray-50"}`}
    >
      {chosen ? "已选择" : "选择"}
    </button>
  );
}
