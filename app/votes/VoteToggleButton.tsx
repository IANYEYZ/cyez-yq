"use client";

export default function VoteToggleButton({
  pollId, optionId, chosen, disabled,
}: { pollId: string; optionId: string; chosen: boolean; disabled: boolean }) {
  async function vote() {
    if (disabled) return;
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
      disabled={disabled}
      className={`rounded border px-2 py-1 text-xs ${chosen ? "bg-black text-white" : "hover:bg-gray-50"} disabled:opacity-50`}
    >
      {chosen ? "已选择" : "选择"}
    </button>
  );
}
