import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import ConfirmDialog from "@/components/ConfirmDialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import useApi from "@/hooks/useApi";
import { getDivisiList, updateDivisi, deleteDivisi } from "@/api/divisiApi";

function DivisiList() {
  const { data: divisiList, loading, error, refetch, setData } = useApi(() => getDivisiList(), []);
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleToggleAktif(divisi) {
    // Update optimis di UI dulu, biar responsif -- rollback kalau gagal.
    setData((prev) => prev.map((d) => (d.slug === divisi.slug ? { ...d, aktif: !d.aktif } : d)));
    try {
      await updateDivisi(divisi.slug, { aktif: !divisi.aktif });
      showToast(`Divisi "${divisi.label}" ${!divisi.aktif ? "diaktifkan" : "disembunyikan"}.`);
    } catch (err) {
      setData((prev) => prev.map((d) => (d.slug === divisi.slug ? { ...d, aktif: divisi.aktif } : d)));
      showToast(err.message || "Gagal mengubah status.", "error");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDivisi(deleteTarget.slug);
      showToast(`Divisi "${deleteTarget.label}" dihapus.`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      showToast(err.message || "Gagal menghapus divisi.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Divisi Magang"
        description="Kelola posisi/divisi yang tampil di section 'Formasi Magang'."
        action={
          <Link to="/divisi/baru">
            <Button>+ Tambah Divisi</Button>
          </Link>
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {divisiList && divisiList.length === 0 ? <EmptyState label="Belum ada divisi." /> : null}

      {divisiList && divisiList.length > 0 ? (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-black/[0.02] text-xs uppercase text-black/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Icon</th>
                <th className="px-4 py-3 font-semibold">Nama Divisi</th>
                <th className="px-4 py-3 font-semibold">Urutan</th>
                <th className="px-4 py-3 font-semibold">Aktif</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {divisiList.map((d) => (
                <tr key={d.slug} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3">
                    {d.icon ? (
                      <img src={d.icon} alt="" className="size-8 object-contain" />
                    ) : (
                      <span className="text-black/30">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-mj-ink">{d.label}</p>
                    {d.sub_label ? <p className="text-xs text-black/40">{d.sub_label}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-black/60">{d.urutan}</td>
                  <td className="px-4 py-3">
                    <Toggle checked={d.aktif} onChange={() => handleToggleAktif(d)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/divisi/${d.slug}`}
                      className="mr-3 text-sm font-semibold text-mj-green hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(d)}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus divisi ini?"
        message={`"${deleteTarget?.label}" akan dihapus permanen, termasuk semua jobdesk-nya. Aksi ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default DivisiList;
