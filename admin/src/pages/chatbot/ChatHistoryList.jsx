import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateViews";
import useApi from "@/hooks/useApi";
import { getChatHistoryList } from "@/api/chatbotApi";

function formatDate(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ChatHistoryList() {
  const { data: visitors, loading, error, refetch } = useApi(() => getChatHistoryList(), []);

  return (
    <div>
      <PageHeader
        title="Riwayat Chat"
        description="Daftar pengunjung yang pernah chat dengan chatbot, beserta transkripnya."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {visitors && visitors.length === 0 ? <EmptyState label="Belum ada riwayat chat." /> : null}

      {visitors && visitors.length > 0 ? (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-black/[0.02] text-xs uppercase text-black/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">No. Telepon</th>
                <th className="px-4 py-3 font-semibold">Jumlah Pesan</th>
                <th className="px-4 py-3 font-semibold">Terakhir Aktif</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-mj-ink">{v.nama}</td>
                  <td className="px-4 py-3 text-black/60">{v.no_telepon}</td>
                  <td className="px-4 py-3 text-black/60">{v.jumlah_pesan}</td>
                  <td className="px-4 py-3 text-black/60">{formatDate(v.terakhir_aktif)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/chatbot/riwayat/${v.id}`}
                      className="text-sm font-semibold text-mj-green hover:underline"
                    >
                      Lihat Transkrip
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default ChatHistoryList;
