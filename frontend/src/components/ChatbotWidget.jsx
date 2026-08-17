import { useEffect, useRef, useState } from "react";
import { registerVisitor, sendChatMessage } from "@/api/chatbotApi";

const STORAGE_KEY = "magangjogja_chat_visitor";

function loadStoredVisitor() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
      <path
        d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-4.5 4V17H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IdentityForm({ onSubmit, submitting, error }) {
  const [nama, setNama] = useState("");
  const [noTelepon, setNoTelepon] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!nama.trim() || !noTelepon.trim()) return;
    onSubmit(nama.trim(), noTelepon.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col justify-center gap-3 p-5">
      <p className="text-center text-[0.9rem] font-medium text-mj-ink">
        Isi nama & nomor WhatsApp kamu dulu ya, biar admin bisa follow up kalau perlu 🙂
      </p>
      <input
        type="text"
        placeholder="Nama kamu"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-mj-green"
        required
      />
      <input
        type="tel"
        placeholder="Nomor WhatsApp (mis. 0812xxxxxxx)"
        value={noTelepon}
        onChange={(e) => setNoTelepon(e.target.value)}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-mj-green"
        required
      />
      {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-mj-green py-2 text-sm font-bold uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Memulai..." : "Mulai Chat"}
      </button>
    </form>
  );
}

function ActionButton({ aksi }) {
  if (!aksi) return null;
  return (
    <a
      href={aksi.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-block rounded-full bg-mj-green px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
    >
      {aksi.label} ↗
    </a>
  );
}

function MessageBubble({ pengirim, pesan, aksi }) {
  const isUser = pengirim === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} gap-1`}>
      <div
        className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
          isUser ? "rounded-br-sm bg-mj-green text-white" : "rounded-bl-sm bg-white text-mj-ink shadow"
        }`}
      >
        {pesan}
      </div>
      {!isUser ? <ActionButton aksi={aksi} /> : null}
    </div>
  );
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [visitor, setVisitor] = useState(loadStoredVisitor);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const [messages, setMessages] = useState([
    {
      pengirim: "bot",
      pesan: "Halo! Ada yang bisa dibantu seputar program magang di magangjogja.com?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleRegister(nama, noTelepon) {
    setRegistering(true);
    setRegisterError(null);
    try {
      const data = await registerVisitor(nama, noTelepon);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setVisitor(data);
    } catch (err) {
      setRegisterError(err.message || "Gagal memulai chat. Coba lagi.");
    } finally {
      setRegistering(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const pesan = input.trim();
    if (!pesan || sending) return;

    setMessages((prev) => [...prev, { pengirim: "user", pesan }]);
    setInput("");
    setSending(true);

    try {
      const data = await sendChatMessage(visitor.id, pesan);
      setMessages((prev) => [...prev, { pengirim: "bot", pesan: data.pesan, aksi: data.aksi }]);
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
        setVisitor(null);
      }
      setMessages((prev) => [
        ...prev,
        { pengirim: "bot", pesan: err.message || "Maaf, terjadi kesalahan. Coba lagi." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup chat" : "Buka chat"}
        className="fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-mj-green text-white shadow-lg transition-transform duration-300 hover:scale-105"
      >
        {open ? <CloseIcon /> : <ChatBubbleIcon />}
      </button>

      {open ? (
        <div className="fixed bottom-24 left-6 z-50 flex h-[28rem] w-[20rem] flex-col overflow-hidden rounded-2xl bg-mj-yellow shadow-2xl sm:w-[22rem]">
          <div className="bg-mj-green-dark px-4 py-3 text-white">
            <p className="text-sm font-bold">Chat magangjogja.com</p>
            <p className="text-xs text-white/80">Biasanya balas dalam beberapa detik</p>
          </div>

          {!visitor ? (
            <IdentityForm onSubmit={handleRegister} submitting={registering} error={registerError} />
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
                {messages.map((m, i) => (
                  <MessageBubble key={i} pengirim={m.pengirim} pesan={m.pesan} aksi={m.aksi} />
                ))}
                {sending ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-mj-ink shadow">
                      Mengetik...
                    </div>
                  </div>
                ) : null}
              </div>

              <form onSubmit={handleSend} className="flex gap-2 border-t border-black/10 p-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="flex-1 rounded-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-mj-green"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-mj-green px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Kirim
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}
    </>
  );
}

export default ChatbotWidget;
