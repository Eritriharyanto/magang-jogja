import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DivisiList from "@/pages/divisi/DivisiList";
import DivisiForm from "@/pages/divisi/DivisiForm";
import HeroEditor from "@/pages/homepage/HeroEditor";
import KontakEditor from "@/pages/homepage/KontakEditor";
import SyaratPage from "@/pages/homepage/SyaratPage";
import FasilitasPage from "@/pages/homepage/FasilitasPage";
import IntentList from "@/pages/chatbot/IntentList";
import IntentForm from "@/pages/chatbot/IntentForm";
import KnowledgeList from "@/pages/chatbot/KnowledgeList";
import KnowledgeForm from "@/pages/chatbot/KnowledgeForm";
import ChatHistoryList from "@/pages/chatbot/ChatHistoryList";
import ChatHistoryDetail from "@/pages/chatbot/ChatHistoryDetail";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />

        <Route path="/divisi" element={<DivisiList />} />
        <Route path="/divisi/baru" element={<DivisiForm />} />
        <Route path="/divisi/:slug" element={<DivisiForm />} />

        <Route path="/homepage/hero" element={<HeroEditor />} />
        <Route path="/homepage/kontak" element={<KontakEditor />} />
        <Route path="/homepage/syarat" element={<SyaratPage />} />
        <Route path="/homepage/fasilitas" element={<FasilitasPage />} />

        <Route path="/chatbot/intents" element={<IntentList />} />
        <Route path="/chatbot/intents/baru" element={<IntentForm />} />
        <Route path="/chatbot/intents/:id" element={<IntentForm />} />
        <Route path="/chatbot/knowledge" element={<KnowledgeList />} />
        <Route path="/chatbot/knowledge/baru" element={<KnowledgeForm />} />
        <Route path="/chatbot/knowledge/:id" element={<KnowledgeForm />} />
        <Route path="/chatbot/riwayat" element={<ChatHistoryList />} />
        <Route path="/chatbot/riwayat/:visitorId" element={<ChatHistoryDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
