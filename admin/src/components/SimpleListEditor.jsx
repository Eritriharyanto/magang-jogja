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
 * enablePhoto: kalau true, tiap item bisa dilampiri foto (dipakai Syarat & Ketentuan)
 */
function SimpleListEditor({ title, description, api, itemLabel, enablePhoto = false }) {
  const { data: items, loading, error, refetch, setData } = useApi(() => api.list(), []);
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState(null); // null = tidak ada yg diedit, "new" = form tambah baru
  const [draftTeks, setDraftTeks] = useState("");
  const [draftFoto, setDraftFoto] = useState(null); // File baru yang dipilih (belum diupload)
  const [draftFotoPreview, setDraftFotoPreview] = useState(null); // URL foto lama ATAU preview foto baru
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function startEdit(item) {
    setEditingId(item.id);
    setDraftTeks(item.teks);
    setDraftFoto(null);
    setDraftFotoPreview(item.foto || null);
  }

  function startCreate() {
    setEditingId("new");
    setDraftTeks("");
    setDraftFoto(null);
    setDraftFotoPreview(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftTeks("");
    setDraftFoto(null);
    setDraftFotoPreview(null);
  }

  function handlePickFoto(e) {
    const file = e.target.files?.[0] || null;
    setDraftFoto(file);
    setDraftFotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSave() {
    if (!draftTeks.trim()) return;
    setSaving(true);
    try {
      if (editingId === "new") {
        const payload = { teks: draftTeks, urutan: items.length };
        if (enablePhoto && draftFoto) payload.foto = draftFoto;
        await api.create(payload);
        showToast(`${itemLabel} baru ditambahkan.`);
      } else {
        const payload = { teks: draftTeks };
        if (enablePhoto && draftFoto) payload.foto = draftFoto;
        await api.update(editingId, payload);
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

  function renderFotoField() {
    if (!enablePhoto) return null;
    return (
      <div className="mt-3 flex items-center gap-3">
        {draftFotoPreview ? (
          <img
            src={draftFotoPreview}
            alt=""
            className="size-16 shrink-0 rounded-lg border border-black/10 object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-black/15 text-[0.65rem] text-black/30">
            Tanpa foto
          </span>
        )}
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-mj-ink">Foto (opsional)</span>
          <input type="file" accept="image/*" onChange={handlePickFoto} className="text-xs" />
        </label>
      </div>
    );
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
            {renderFotoField()}
            <div className="mt-3 flex justify-end gap-2">
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
              {renderFotoField()}
              <div className="mt-3 flex justify-end gap-2">
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
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {enablePhoto && item.foto ? (
                  <img
                    src={item.foto}
                    alt=""
                    className="size-12 shrink-0 rounded-lg border border-black/10 object-cover"
                  />
                ) : null}
                <p className="flex-1 whitespace-pre-line text-sm text-mj-ink">{item.teks}</p>
              </div>
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
