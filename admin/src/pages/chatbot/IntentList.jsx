import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import ConfirmDialog from "@/components/ConfirmDialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import useApi from "@/hooks/useApi";
import { getIntentList, updateIntent, deleteIntent } from "@/api/chatbotApi";

function IntentList() {
  const { data: intents, loading, error, refetch, setData } = useApi(() => getIntentList(), []);
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleToggleAktif(intent) {
    setData((prev) => prev.map((i) => (i.id === intent.id ? { ...i, aktif: !i.aktif } : i)));
    try {
      await updateIntent(intent.id, { aktif: !intent.aktif });
    } catch (err) {
      setData((prev) => prev.map((i) => (i.id === intent.id ? { ...i, aktif: intent.aktif } : i)));
      showToast(err.message || "Gagal mengubah status.", "error");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteIntent(deleteTarget.id);
      showToast(`Intent "${deleteTarget.nama}" dihapus.`);
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
        title="Intent Chatbot"
        description="Jawaban statis chatbot. Semakin banyak & variatif contoh pertanyaan, semakin akurat pencocokannya."
        action={
          <Link to="/chatbot/intents/baru">
            <Button>+ Tambah Intent</Button>
          </Link>
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {intents && intents.length === 0 ? <EmptyState label="Belum ada intent." /> : null}

      {intents && intents.length > 0 ? (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-black/[0.02] text-xs uppercase text-black/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Intent</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Contoh Kalimat</th>
                <th className="px-4 py-3 font-semibold">Aktif</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {intents.map((intent) => (
                <tr key={intent.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-mj-ink">{intent.nama || "(tanpa nama)"}</td>
                  <td className="px-4 py-3 text-black/60">{intent.kategori || "-"}</td>
                  <td className="px-4 py-3 text-black/60">{intent.contoh_pertanyaan.length} kalimat</td>
                  <td className="px-4 py-3">
                    <Toggle checked={intent.aktif} onChange={() => handleToggleAktif(intent)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/chatbot/intents/${intent.id}`}
                      className="mr-3 text-sm font-semibold text-mj-green hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(intent)}
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
        title="Hapus intent ini?"
        message={`Intent "${deleteTarget?.nama}" akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default IntentList;
