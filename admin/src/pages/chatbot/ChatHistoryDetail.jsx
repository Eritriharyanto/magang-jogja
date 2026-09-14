import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { LoadingState, ErrorState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import useApi from "@/hooks/useApi";
import { getChatHistoryDetail, deleteChatHistory } from "@/api/chatbotApi";
import { buildWaLink } from "@/lib/whatsapp";

const SUMBER_LABEL = {
  static: "Intent Statis",
  ollama: "Ollama (AI)",
  guard: "Ditolak (Di Luar Topik)",
  system: "Sistem",
};

function formatTime(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ChatHistoryDetail() {
  const { visitorId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    data: visitor,
    loading,
    error,
  } = useApi(() => getChatHistoryDetail(visitorId), [visitorId]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteChatHistory(visitorId);
      showToast("Riwayat chat dihapus.");
      navigate("/chatbot/riwayat");
    } catch (err) {
      showToast(err.message || "Gagal menghapus riwayat chat.", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div>
      <Link
        to='/chatbot/riwayat'
        className='mb-4 inline-block text-sm text-mj-green hover:underline'
      >
        &larr; Kembali ke daftar
      </Link>
      <PageHeader
        title={`Transkrip: ${visitor.nama}`}
        description={`${visitor.no_telepon} · ${visitor.jumlah_pesan} pesan`}
        action={
          <div className='flex gap-2'>
            <a
              href={buildWaLink(visitor.no_telepon)}
              target='_blank'
              rel='noreferrer'
            >
              <Button variant='secondary'>Chat via WhatsApp</Button>
            </a>
            <Button variant='danger' onClick={() => setConfirmDelete(true)}>
              Hapus
            </Button>
          </div>
        }
      />

      <div className='space-y-3 rounded-xl bg-white p-5 shadow-sm'>
        {visitor.messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.pengirim === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                m.pengirim === "user"
                  ? "bg-mj-green text-white"
                  : "bg-black/5 text-mj-ink"
              }`}
            >
              <p className='whitespace-pre-line'>{m.pesan}</p>
              <p className='mt-1 text-[0.7rem] opacity-60'>
                {formatTime(m.dibuat_pada)}
                {m.sumber ? ` · ${SUMBER_LABEL[m.sumber] || m.sumber}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title='Hapus riwayat chat ini?'
        message={`Seluruh transkrip chat "${visitor.nama}" akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
      />
    </div>
  );
}

export default ChatHistoryDetail;
