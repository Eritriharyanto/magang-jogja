import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import { Textarea } from "@/components/Field";
import ConfirmDialog from "@/components/ConfirmDialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import useApi from "@/hooks/useApi";

/**
 * title/description: teks header halaman
 * api: { list, create, update, delete } -- fungsi dari homepageApi.js
 * itemLabel: dipakai di pesan konfirmasi hapus & tombol tambah
 */
function SimpleListEditor({ title, description, api, itemLabel }) {
  const { data: items, loading, error, refetch, setData } = useApi(() => api.list(), []);
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState(null); // null = tidak ada yg diedit, "new" = form tambah baru
  const [draftTeks, setDraftTeks] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function startEdit(item) {
    setEditingId(item.id);
    setDraftTeks(item.teks);
  }

  function startCreate() {
    setEditingId("new");
    setDraftTeks("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftTeks("");
  }

  async function handleSave() {
    if (!draftTeks.trim()) return;
    setSaving(true);
    try {
      if (editingId === "new") {
        await api.create({ teks: draftTeks, urutan: items.length });
        showToast(`${itemLabel} baru ditambahkan.`);
      } else {
        await api.update(editingId, { teks: draftTeks });
        showToast(`${itemLabel} diperbarui.`);
      }
      cancelEdit();
      refetch();
    } catch (err) {
      showToast(err.message || "Gagal menyimpan.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAktif(item) {
    setData((prev) => prev.map((i) => (i.id === item.id ? { ...i, aktif: !i.aktif } : i)));
    try {
      await api.update(item.id, { aktif: !item.aktif });
    } catch (err) {
      setData((prev) => prev.map((i) => (i.id === item.id ? { ...i, aktif: item.aktif } : i)));
      showToast(err.message || "Gagal mengubah status.", "error");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(deleteTarget.id);
      showToast(`${itemLabel} dihapus.`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      showToast(err.message || "Gagal menghapus.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={<Button onClick={startCreate}>+ Tambah {itemLabel}</Button>}
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {items && items.length === 0 && editingId !== "new" ? (
        <EmptyState label={`Belum ada ${itemLabel.toLowerCase()}.`} />
      ) : null}

      <div className="space-y-2">
        {editingId === "new" ? (
          <div className="rounded-xl border-2 border-mj-green bg-white p-4">
            <Textarea
              value={draftTeks}
              onChange={(e) => setDraftTeks(e.target.value)}
              placeholder={`Isi ${itemLabel.toLowerCase()} baru...`}
              autoFocus
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="secondary" onClick={cancelEdit}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        ) : null}

        {items?.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="rounded-xl border-2 border-mj-green bg-white p-4">
              <Textarea value={draftTeks} onChange={(e) => setDraftTeks(e.target.value)} autoFocus />
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={cancelEdit}>
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-xl bg-white p-4 shadow-sm"
            >
              <p className="flex-1 whitespace-pre-line text-sm text-mj-ink">{item.teks}</p>
              <div className="flex shrink-0 items-center gap-3">
                <Toggle checked={item.aktif} onChange={() => handleToggleAktif(item)} />
                <button
                  onClick={() => startEdit(item)}
                  className="text-sm font-semibold text-mj-green hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Hapus ${itemLabel.toLowerCase()} ini?`}
        message="Aksi ini tidak bisa dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default SimpleListEditor;
