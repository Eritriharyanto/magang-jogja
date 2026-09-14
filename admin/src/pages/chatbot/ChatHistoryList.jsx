import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import SearchInput from "@/components/SearchInput";
import { LoadingState, ErrorState, EmptyState } from "@/components/StateViews";
import { useToast } from "@/context/ToastContext";
import useApi from "@/hooks/useApi";
import { getChatHistoryList, deleteChatHistory } from "@/api/chatbotApi";
import { buildWaLink } from "@/lib/whatsapp";

function formatDate(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function IconWhatsapp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 2 3 4.7 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3 0-.1-.2-.2-.5-.3z" />
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
    </svg>
  );
}

function ChatHistoryList() {
  const { data: visitors, loading, error, refetch, setData } = useApi(() => getChatHistoryList(), []);
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!visitors) return [];
    const q = query.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter(
      (v) => v.nama.toLowerCase().includes(q) || v.no_telepon.toLowerCase().includes(q)
    );
  }, [visitors, query]);

  const [selected, setSelected] = useState(new Set());
  const [singleTarget, setSingleTarget] = useState(null); // visitor yang mau dihapus sendirian
  const [bulkMode, setBulkMode] = useState(null); // "selected" | "all" | null
  const [deleting, setDeleting] = useState(false);

  const allSelected = results.length > 0 && results.every((v) => selected.has(v.id));

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        results.forEach((v) => next.delete(v.id));
      } else {
        results.forEach((v) => next.add(v.id));
      }
      return next;
    });
  }

  async function runDelete(ids) {
    setDeleting(true);
    try {
      await Promise.all(ids.map((id) => deleteChatHistory(id)));
      showToast(ids.length > 1 ? `${ids.length} riwayat chat dihapus.` : "Riwayat chat dihapus.");
      setData((prev) => prev.filter((v) => !ids.includes(v.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err) {
      showToast(err.message || "Gagal menghapus riwayat chat.", "error");
    } finally {
      setDeleting(false);
      setSingleTarget(null);
      setBulkMode(null);
    }
  }

  function handleConfirmDelete() {
    if (singleTarget) return runDelete([singleTarget.id]);
    if (bulkMode === "selected") return runDelete([...selected]);
    if (bulkMode === "all") return runDelete((visitors || []).map((v) => v.id));
  }

  const dialogOpen = Boolean(singleTarget) || Boolean(bulkMode);
  const dialogTitle = singleTarget
    ? "Hapus riwayat chat ini?"
    : bulkMode === "all"
      ? "Hapus semua riwayat chat?"
      : `Hapus ${selected.size} riwayat terpilih?`;
  const dialogMessage = singleTarget
    ? `Seluruh transkrip chat "${singleTarget.nama}" akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`
    : bulkMode === "all"
      ? `Semua ${visitors?.length || 0} riwayat pengunjung beserta transkripnya akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`
      : "Riwayat & transkrip yang dipilih akan dihapus permanen. Aksi ini tidak bisa dibatalkan.";

  return (
    <div>
      <PageHeader
        title="Riwayat Chat"
        description="Daftar pengunjung yang pernah chat dengan chatbot, beserta transkripnya."
        action={
          visitors && visitors.length > 0 ? (
            <Button variant="danger" onClick={() => setBulkMode("all")}>
              Hapus Semua
            </Button>
          ) : null
        }
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}
      {visitors && visitors.length === 0 ? <EmptyState label="Belum ada riwayat chat." /> : null}

      {visitors && visitors.length > 0 ? (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Cari nama atau no. telepon..." />
            {selected.size > 0 ? (
              <Button variant="danger" onClick={() => setBulkMode("selected")}>
                Hapus Terpilih ({selected.size})
              </Button>
            ) : null}
          </div>

          {results.length === 0 ? (
            <EmptyState label={`Tidak ada pengunjung yang cocok dengan "${query}".`} />
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-black/10 bg-black/[0.02] text-xs uppercase text-black/50">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} className="size-4" />
                    </th>
                    <th className="px-4 py-3 font-semibold">Nama</th>
                    <th className="px-4 py-3 font-semibold">No. Telepon</th>
                    <th className="px-4 py-3 font-semibold">Jumlah Pesan</th>
                    <th className="px-4 py-3 font-semibold">Terakhir Aktif</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {results.map((v) => (
                    <tr key={v.id} className="border-b border-black/5 last:border-0">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(v.id)}
                          onChange={() => toggleOne(v.id)}
                          className="size-4"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-mj-ink">{v.nama}</td>
                      <td className="px-4 py-3 text-black/60">{v.no_telepon}</td>
                      <td className="px-4 py-3 text-black/60">{v.jumlah_pesan}</td>
                      <td className="px-4 py-3 text-black/60">{formatDate(v.terakhir_aktif)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-4">
                          <a
                            href={buildWaLink(v.no_telepon)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline"
                            title="Chat langsung via WhatsApp"
                          >
                            <IconWhatsapp className="size-4" />
                            WA
                          </a>
                          <Link
                            to={`/chatbot/riwayat/${v.id}`}
                            className="text-sm font-semibold text-mj-green hover:underline"
                          >
                            Lihat Transkrip
                          </Link>
                          <button
                            onClick={() => setSingleTarget(v)}
                            className="text-sm font-semibold text-red-600 hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}

      <ConfirmDialog
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setSingleTarget(null);
          setBulkMode(null);
        }}
        loading={deleting}
      />
    </div>
  );
}

export default ChatHistoryList;
