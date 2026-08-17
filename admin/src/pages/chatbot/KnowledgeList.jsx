import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import ConfirmDialog from "@/components/ConfirmDialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import useApi from "@/hooks/useApi";
import { getKnowledgeList, updateKnowledge, deleteKnowledge } from "@/api/chatbotApi";

function KnowledgeList() {
  const { data: entries, loading, error, refetch, setData } = useApi(() => getKnowledgeList(), []);
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleToggleAktif(entry) {
    setData((prev) => prev.map((e) => (e.id === entry.id ? { ...e, aktif: !e.aktif } : e)));
    try {
      await updateKnowledge(entry.id, { aktif: !entry.aktif });
    } catch (err) {
      setData((prev) => prev.map((e) => (e.id === entry.id ? { ...e, aktif: entry.aktif } : e)));
      showToast(err.message || "Gagal mengubah status.", "error");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteKnowledge(deleteTarget.id);
      showToast(`"${deleteTarget.judul}" dihapus.`);
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
        title="Knowledge Base"
        description="Data yang disuapkan ke Ollama sebagai konteks jawaban AI, untuk pertanyaan di luar intent statis."
        action={
          <Link to="/chatbot/knowledge/baru">
            <Button>+ Tambah Entry</Button>
          </Link>
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {entries && entries.length === 0 ? <EmptyState label="Belum ada knowledge entry." /> : null}

      <div className="space-y-2">
        {entries?.map((entry) => (
          <div key={entry.id} className="flex items-start justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-mj-ink">{entry.judul}</p>
              <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-black/50">{entry.konten}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Toggle checked={entry.aktif} onChange={() => handleToggleAktif(entry)} />
              <Link
                to={`/chatbot/knowledge/${entry.id}`}
                className="text-sm font-semibold text-mj-green hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => setDeleteTarget(entry)}
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus entry ini?"
        message={`"${deleteTarget?.judul}" akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default KnowledgeList;
