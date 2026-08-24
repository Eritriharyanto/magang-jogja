import { Link } from "react-router-dom";
import { ErrorState, EmptyState } from "@/components/StateViews";
import useApi from "@/hooks/useApi";
import { getDivisiList } from "@/api/divisiApi";
import { getSyaratList, getFasilitasList } from "@/api/homepageApi";
import { getIntentList, getKnowledgeList, getChatHistoryList } from "@/api/chatbotApi";

/* -------------------------------------------------------------------- */
/* Icon set kecil (inline SVG, tanpa dependency tambahan)                */
/* -------------------------------------------------------------------- */
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconBriefcase(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}
function IconClipboardCheck(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="m9 13 2 2 4-4" />
    </svg>
  );
}
function IconSparkles(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6.5 6.5 2 2M15.5 15.5l2 2M6.5 17.5l2-2M15.5 8.5l2-2" />
    </svg>
  );
}
function IconChat(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M21 12a8 8 0 1 1-3.4-6.5" />
      <path d="M21 3v6h-6" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}
function IconBook(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}
function IconUsers(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconMessageDot(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconArrowRight(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

/* -------------------------------------------------------------------- */

const CARDS = [
  {
    key: "divisi",
    label: "Divisi Magang",
    to: "/divisi",
    icon: IconBriefcase,
    badge: "bg-mj-green/10 text-mj-green-deep",
  },
  {
    key: "syarat",
    label: "Syarat & Ketentuan",
    to: "/homepage/syarat",
    icon: IconClipboardCheck,
    badge: "bg-mj-yellow/15 text-mj-orange",
  },
  {
    key: "fasilitas",
    label: "Fasilitas",
    to: "/homepage/fasilitas",
    icon: IconSparkles,
    badge: "bg-mj-red/10 text-mj-red",
  },
  {
    key: "intent",
    label: "Intent Chatbot",
    to: "/chatbot/intents",
    icon: IconChat,
    badge: "bg-mj-purple/10 text-mj-purple",
  },
  {
    key: "knowledge",
    label: "Knowledge Base",
    to: "/chatbot/knowledge",
    icon: IconBook,
    badge: "bg-mj-blue/10 text-mj-blue",
  },
  {
    key: "visitor",
    label: "Pengunjung Chat",
    to: "/chatbot/riwayat",
    icon: IconUsers,
    badge: "bg-mj-orange/10 text-mj-orange",
  },
];

const QUICK_ACTIONS = [
  { label: "Tambah Divisi Magang", to: "/divisi/baru" },
  { label: "Tambah Intent Chatbot", to: "/chatbot/intents/baru" },
  { label: "Tambah Knowledge Base", to: "/chatbot/knowledge/baru" },
  { label: "Edit Hero Homepage", to: "/homepage/hero" },
];

function countAktif(list) {
  return list.filter((item) => item.aktif).length;
}

function formatWaktuRelatif(iso) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  return rtf.format(Math.round(diffHour / 24), "day");
}

function initials(nama) {
  return (nama || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-black/5 bg-white p-5">
          <div className="size-10 rounded-xl bg-black/5" />
          <div className="mt-4 h-7 w-10 rounded bg-black/10" />
          <div className="mt-2 h-3 w-20 rounded bg-black/10" />
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { data, loading, error, refetch } = useApi(async () => {
    const [divisi, syarat, fasilitas, intent, knowledge, visitor] = await Promise.all([
      getDivisiList(),
      getSyaratList(),
      getFasilitasList(),
      getIntentList(),
      getKnowledgeList(),
      getChatHistoryList(),
    ]);

    return {
      divisi: { total: divisi.length, aktif: countAktif(divisi) },
      syarat: { total: syarat.length, aktif: countAktif(syarat) },
      fasilitas: { total: fasilitas.length, aktif: countAktif(fasilitas) },
      intent: { total: intent.length, aktif: countAktif(intent) },
      knowledge: { total: knowledge.length, aktif: countAktif(knowledge) },
      visitor: {
        total: visitor.length,
        pesan: visitor.reduce((sum, v) => sum + (v.jumlah_pesan || 0), 0),
      },
      recentVisitors: visitor.slice(0, 5),
    };
  }, []);

  const hour = new Date().getHours();
  const sapaan =
    hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
  const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Header sambutan */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-mj-green-dark to-mj-green px-6 py-6 text-white shadow-sm sm:px-8 sm:py-7">
        <p className="text-sm font-medium text-white/80">{sapaan}, Admin 👋</p>
        <h1 className="mj-display mt-1 text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-1.5 text-sm text-white/80">
          {tanggalHariIni} &middot; Ringkasan konten website &amp; chatbot magangjogja.com
        </p>
      </div>

      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {loading ? <StatSkeleton /> : null}

      {data ? (
        <>
          {/* Kartu statistik */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CARDS.map((card) => {
              const Icon = card.icon;
              const stat = data[card.key];
              return (
                <Link
                  key={card.key}
                  to={card.to}
                  className="group rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className={`inline-flex size-10 items-center justify-center rounded-xl ${card.badge}`}>
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 text-3xl font-bold leading-none text-mj-ink">{stat.total}</p>
                  <p className="mt-1.5 text-sm font-medium text-black/60">{card.label}</p>
                  {"aktif" in stat ? (
                    <p className="mt-2 text-xs text-black/40">
                      {stat.aktif} aktif dari {stat.total}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-black/40">{stat.pesan} total pesan</p>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Aktivitas terbaru + aksi cepat */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                <h2 className="font-semibold text-mj-ink">Aktivitas Chat Terbaru</h2>
                <Link
                  to="/chatbot/riwayat"
                  className="flex items-center gap-1 text-xs font-semibold text-mj-green hover:underline"
                >
                  Lihat semua <IconArrowRight className="size-3.5" />
                </Link>
              </div>

              {data.recentVisitors.length === 0 ? (
                <EmptyState label="Belum ada pengunjung chat." />
              ) : (
                <ul className="divide-y divide-black/5">
                  {data.recentVisitors.map((v) => (
                    <li key={v.id}>
                      <Link
                        to={`/chatbot/riwayat/${v.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mj-green/10 text-xs font-bold text-mj-green-deep">
                          {initials(v.nama)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-mj-ink">{v.nama}</span>
                          <span className="block truncate text-xs text-black/50">{v.no_telepon}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-black/40">
                          <IconMessageDot className="size-3.5" />
                          {v.jumlah_pesan}
                        </span>
                        <span className="w-24 shrink-0 text-right text-xs text-black/40">
                          {formatWaktuRelatif(v.terakhir_aktif)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="border-b border-black/5 px-5 py-4">
                <h2 className="font-semibold text-mj-ink">Aksi Cepat</h2>
              </div>
              <div className="space-y-1 p-3">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-mj-ink transition-colors hover:bg-mj-green/10 hover:text-mj-green-deep"
                  >
                    {action.label}
                    <IconArrowRight className="size-4 text-black/30" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default Dashboard;
