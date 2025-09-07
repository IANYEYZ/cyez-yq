"use client";

export default function DeleteButtonClient({ id }: { id: string }) {
  async function onDelete() {
    if (!confirm("确定要删除这条表白吗？(This cannot be undone)")) return;
    const r = await fetch(`/api/confessions/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error ?? "删除失败");
      return;
    }
    // reload list
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
