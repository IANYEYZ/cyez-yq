"use client";

export default function DeletePollButton({ id }: { id: string }) {
  async function del() {
    if (!confirm("删除这个投票？此操作无法撤销。")) return;
    const r = await fetch(`/api/votes/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(()=>({}));
      alert(j?.error ?? "删除失败 / Delete failed");
      return;
    }
    window.location.reload();
  }
  return (
    <button onClick={del} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">删除</button>
  );
}
