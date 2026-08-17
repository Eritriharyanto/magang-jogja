import { Link, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState } from "@/components/StateViews";
import useApi from "@/hooks/useApi";
import { getChatHistoryDetail } from "@/api/chatbotApi";

const SUMBER_LABEL = {
  static: "Intent Statis",
  ollama: "Ollama (AI)",
  guard: "Ditolak (Di Luar Topik)",
  system: "Sistem",
};

function formatTime(iso) {
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function ChatHistoryDetail() {
  const { visitorId } = useParams();
  const { data: visitor, loading, error } = useApi(() => getChatHistoryDetail(visitorId), [visitorId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      <Link to="/chatbot/riwayat" className="mb-4 inline-block text-sm text-mj-green hover:underline">
        &larr; Kembali ke daftar
      </Link>
      <PageHeader
        title={`Transkrip: ${visitor.nama}`}
        description={`${visitor.no_telepon} · ${visitor.jumlah_pesan} pesan`}
      />

      <div className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        {visitor.messages.map((m) => (
          <div key={m.id} className={`flex ${m.pengirim === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                m.pengirim === "user" ? "bg-mj-green text-white" : "bg-black/5 text-mj-ink"
              }`}
            >
              <p className="whitespace-pre-line">{m.pesan}</p>
              <p className="mt-1 text-[0.7rem] opacity-60">
                {formatTime(m.dibuat_pada)}
                {m.sumber ? ` · ${SUMBER_LABEL[m.sumber] || m.sumber}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatHistoryDetail;
