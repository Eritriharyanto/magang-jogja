import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV_GROUPS = [
  {
    title: "Umum",
    items: [{ to: "/", label: "Dashboard", end: true }],
  },
  {
    title: "Posisi Magang",
    items: [{ to: "/divisi", label: "Divisi" }],
  },
  {
    title: "Konten Homepage",
    items: [
      { to: "/homepage/hero", label: "Hero" },
      { to: "/homepage/kontak", label: "Kontak" },
      { to: "/homepage/syarat", label: "Syarat & Ketentuan" },
      { to: "/homepage/fasilitas", label: "Fasilitas" },
    ],
  },
  {
    title: "Chatbot",
    items: [
      { to: "/chatbot/intents", label: "Intent" },
      { to: "/chatbot/knowledge", label: "Knowledge Base" },
      { to: "/chatbot/riwayat", label: "Riwayat Chat" },
    ],
  },
];

function Layout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f4f6f5]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-black/10 bg-mj-green-dark text-white">
        <div className="px-5 py-5">
          <p className="mj-display text-lg font-bold">magangjogja</p>
          <p className="text-xs text-white/70">Admin Dashboard</p>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-2 text-[0.7rem] font-bold uppercase tracking-wide text-white/50">
                {group.title}
              </p>
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          <button
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-white/80 hover:bg-white/10"
          >
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
