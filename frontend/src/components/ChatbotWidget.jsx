import { useEffect, useRef, useState } from "react";
import useChatbot from "@/hooks/useChatbot";

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-7">
      <path
        d="M4 4h16v12H7l-3 3V4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5">
      <path
        d="M3 11l18-8-8 18-2-8-8-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IdentityForm({ onSubmit, submitting, error }) {
  const [nama, setNama] = useState("");
  const [noTelepon, setNoTelepon] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!nama.trim() || !noTelepon.trim() || submitting) return;
    onSubmit(nama.trim(), noTelepon.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-center gap-3 p-5">
      <p className="text-center text-[0.9rem] font-semibold text-mj-ink">
        Kenalan dulu yuk, sebelum mulai chat &#128075;
      </p>
      <input
        type="text"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="Nama kamu"
        autoComplete="name"
        className="rounded-lg border border-black/10 px-4 py-2 text-[0.9rem] outline-none focus:border-mj-green-dark"
        required
      />
      <input
        type="tel"
        value={noTelepon}
        onChange={(e) => setNoTelepon(e.target.value)}
        placeholder="Nomor HP/WhatsApp"
        autoComplete="tel"
        className="rounded-lg border border-black/10 px-4 py-2 text-[0.9rem] outline-none focus:border-mj-green-dark"
        required
      />
      {error ? <p className="text-center text-[0.8rem] text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-full bg-mj-green-dark py-2 text-[0.9rem] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Memulai..." : "Mulai Chat"}
      </button>
      <p className="text-center text-[0.7rem] text-mj-ink/60">
        Data kamu cuma dipakai buat menyambungkan riwayat chat kamu.
      </p>
    </form>
  );
}

function MessageBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2 text-[0.85rem] leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-mj-yellow text-mj-ink"
            : "rounded-bl-sm bg-mj-green text-white"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-mj-green px-4 py-3">
        <span className="size-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-white/80 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-white/80" />
      </div>
    </div>
  );
}

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [identifying, setIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState(null);
  const { visitor, messages, sending, error, identify, sendMessage } = useChatbot();
  const scrollRef = useRef(null);

  // Auto-scroll ke pesan paling bawah setiap ada pesan baru / panel dibuka.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, isOpen]);

  async function handleIdentify(nama, noTelepon) {
    setIdentifying(true);
    setIdentifyError(null);
    try {
      await identify(nama, noTelepon);
    } catch (err) {
      setIdentifyError(err.message || "Gagal memulai chat, coba lagi.");
    } finally {
      setIdentifying(false);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    sendMessage(input.trim());
    setInput("");
  }

  // Tampilkan "sedang mengetik" hanya kalau pesan terakhir masih dari user
  // (artinya bot belum mulai balas sama sekali). Begitu balasan bot mulai
  // muncul/di-stream, indikator ini otomatis hilang digantikan teksnya.
  const lastMessage = messages[messages.length - 1];
  const showTyping = sending && lastMessage?.role === "user";

  return (
    <>
      {/* Panel chat */}
      <div
        className={`fixed bottom-24 left-6 z-50 flex h-[28rem] max-h-[70vh] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        role="dialog"
        aria-label="Chat dengan admin Magangjogja"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between bg-mj-green-dark px-4 py-3">
          <div>
            <p className="text-[0.9rem] font-bold text-white">Chat Admin Magangjogja</p>
            <p className="text-[0.7rem] text-white/70">Biasanya balas dalam beberapa saat</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-white/80 transition-colors hover:text-white"
            aria-label="Tutup chat"
          >
            <CloseIcon />
          </button>
        </div>

        {!visitor ? (
          <IdentityForm onSubmit={handleIdentify} submitting={identifying} error={identifyError} />
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-mj-yellow/15 p-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} text={m.text} />
              ))}
              {showTyping ? <TypingIndicator /> : null}
            </div>

            {error ? (
              <p className="border-t border-black/5 px-4 py-1 text-center text-[0.75rem] text-red-600">
                {error}
              </p>
            ) : null}

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-black/5 p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 rounded-full border border-black/10 px-4 py-2 text-[0.85rem] outline-none focus:border-mj-green-dark"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mj-green-dark text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                aria-label="Kirim pesan"
              >
                <SendIcon />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Tombol bubble */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-mj-green-dark text-white shadow-xl transition-transform hover:scale-105 ${
          isOpen ? "" : "animate-mj-badge-pulse"
        }`}
        aria-label={isOpen ? "Tutup chat" : "Buka chat dengan admin Magangjogja"}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
}

export default ChatbotWidget;
