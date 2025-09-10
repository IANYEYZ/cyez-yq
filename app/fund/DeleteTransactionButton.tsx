"use client";

export default function DeleteTransactionButton({ id }: { id: string }) {
  async function onDelete() {
    if (!confirm("确定要删除这条收支记录吗？此操作无法撤销。")) return;
    const r = await fetch(`/api/fund/transactions/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error ?? "删除失败");
      return;
    }
    window.location.reload();
  }

  return (
    <button
      onClick={onDelete}
      className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
      title="删除"
    >
      删除
    </button>
  );
}
