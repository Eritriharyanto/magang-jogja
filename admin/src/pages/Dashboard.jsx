import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { LoadingState, ErrorState } from "@/components/StateViews";
import useApi from "@/hooks/useApi";
import { getDivisiList } from "@/api/divisiApi";
import { getSyaratList, getFasilitasList } from "@/api/homepageApi";
import { getIntentList, getKnowledgeList, getChatHistoryList } from "@/api/chatbotApi";

const CARDS = [
  { key: "divisi", label: "Divisi Magang", to: "/divisi", color: "bg-mj-green" },
  { key: "syarat", label: "Syarat & Ketentuan", to: "/homepage/syarat", color: "bg-mj-yellow" },
  { key: "fasilitas", label: "Fasilitas", to: "/homepage/fasilitas", color: "bg-mj-red" },
  { key: "intent", label: "Intent Chatbot", to: "/chatbot/intents", color: "bg-mj-purple" },
  { key: "knowledge", label: "Knowledge Base", to: "/chatbot/knowledge", color: "bg-mj-blue" },
  { key: "visitor", label: "Pengunjung Chat", to: "/chatbot/riwayat", color: "bg-mj-orange" },
];

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
      divisi: divisi.length,
      syarat: syarat.length,
      fasilitas: fasilitas.length,
      intent: intent.length,
      knowledge: knowledge.length,
      visitor: visitor.length,
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan konten website & chatbot magangjogja.com"
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={refetch} /> : null}

      {data ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className="rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className={`inline-block size-2.5 rounded-full ${card.color}`} />
              <p className="mt-3 text-2xl font-bold text-mj-ink">{data[card.key]}</p>
              <p className="text-sm text-black/50">{card.label}</p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default Dashboard;
