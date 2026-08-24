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
      <aside className="flex w-64 shrink-0 flex-col bg-mj-green-dark text-white">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="mj-display flex size-9 items-center justify-center rounded-xl bg-white/15 text-base font-bold">
            M
          </span>
          <div>
            <p className="mj-display text-base font-bold leading-tight">magangjogja</p>
            <p className="text-xs text-white/60">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-2 text-[0.7rem] font-bold uppercase tracking-wide text-white/45">
                {group.title}
              </p>
              <div className="mt-1.5 space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `relative block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-mj-yellow" />
                        ) : null}
                        <span className="pl-1.5">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
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
