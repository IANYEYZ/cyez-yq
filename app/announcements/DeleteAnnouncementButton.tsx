"use client";

export default function DeleteAnnouncementButton({ id }: { id: string }) {
  async function onDelete() {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;
    const r = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error ?? "Delete failed");
      return;
    }
    // Refresh the list
    window.location.reload();
  }

  return (
    <button
      onClick={onDelete}
      className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
      title="Delete"
    >
      Delete
    </button>
  );
}
