"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface ParsedSegment {
  type: "text" | "action";
  content: string;
  label?: string;
  href?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GUEST_LIMIT = 4;
const STORAGE_KEY = "lifeline_chat_guest_count";

// ─── Message parser (markdown links → buttons) ───────────────────────────────
// Parses [Label](/path) from AI text into { text, link } segments
function parseMessage(text: string): ParsedSegment[] {
  const parts: ParsedSegment[] = [];
  const regex = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "action", content: match[0], label: match[1].trim(), href: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }
  return parts;
}

// ─── Message Renderer ─────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser    = msg.role === "user";
  const segments  = isUser ? [] : parseMessage(msg.content);
  const hasActions = segments.some(s => s.type === "action");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} group`}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full mr-2 mt-0.5 flex items-center justify-center text-xs font-black text-white"
          style={{ background: "linear-gradient(135deg,#1B3A5C,#3A6EA5)" }}>
          L
        </div>
      )}

      <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
          style={isUser ? {
            background: "linear-gradient(135deg,#C2703A,#d4894e)",
            color: "#fff",
            borderBottomRightRadius: "4px",
          } : {
            background: "rgba(255,255,255,0.07)",
            color: "rgba(245,237,227,0.92)",
            borderBottomLeftRadius: "4px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {segments.map((seg, i) =>
                seg.type === "text"
                  ? <span key={i}>{seg.content}</span>
                  : null
              )}
            </div>
          )}
        </div>

        {/* Action buttons outside the bubble */}
        {hasActions && (
          <div className="flex flex-wrap gap-1.5 mt-1 pl-0.5">
            {segments
              .filter(s => s.type === "action")
              .map((seg, i) => (
                <Link
                  key={i}
                  href={seg.href!}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold
                    transition-all duration-150 hover:scale-105 active:scale-95"
                  style={{
                    background: "rgba(194,112,58,0.2)",
                    border: "1px solid rgba(194,112,58,0.4)",
                    color: "#e8935e",
                  }}
                >
                  <span>→</span>
                  {seg.label}
                </Link>
              ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex-shrink-0 w-7 h-7 rounded-full mr-2 flex items-center justify-center text-xs font-black text-white"
        style={{ background: "linear-gradient(135deg,#1B3A5C,#3A6EA5)" }}>
        L
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderBottomLeftRadius: "4px" }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "rgba(194,112,58,0.7)" }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-2 px-4 py-3 rounded-xl text-xs"
      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
    >
      <div className="flex items-start gap-2">
        <span className="text-base flex-shrink-0">⚠</span>
        <div className="flex-1">
          <p className="font-semibold mb-1">Something went wrong</p>
          <p className="text-red-300/70 leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="mt-2.5 w-full py-1.5 rounded-lg text-xs font-semibold transition-colors"
        style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}
      >
        Try again
      </button>
    </motion.div>
  );
}

// ─── Welcome message helper ───────────────────────────────────────────────────
function makeWelcome(role: string | null, name: string | null): ChatMessage {
  const roleMsg: Record<string, string> = {
    ADMIN:    `Welcome back, ${name ?? "Admin"}! 👋\n\nI have access to your platform's live statistics. Ask me about users, orders, revenue, pending licenses, or any platform KPIs — I'm here to assist with your admin work.`,
    SELLER:   `Welcome back, ${name ?? "Seller"}! 👋\n\nI can see your store's live data — inventory, orders, and revenue. Ask me anything about managing your medicines, handling orders, or growing your sales on LifeLine.`,
    CUSTOMER: `Welcome back, ${name ?? "there"}! 👋\n\nI can see your order history, wallet balance, and wishlist. Ask me about your orders, available medicines, delivery information, or anything else about your LifeLine account.`,
  };

  const guestMsg = `Welcome to **LifeLine**! 👋\n\nI'm LifeLineBot, your healthcare assistant. I can help you with:\n• Medicine information & availability\n• Delivery fees & timelines\n• Platform policies & returns\n• How to get started as a customer or seller\n\nNote: As a guest you have **${GUEST_LIMIT} free messages**. Sign in for unlimited access.`;

  return {
    id:      "welcome",
    role:    "assistant",
    content: role && roleMsg[role] ? roleMsg[role] : guestMsg,
  };
}

// ─── Main FloatingChatbot ─────────────────────────────────────────────────────
export function FloatingChatbot() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [user,      setUser]      = useState<{ name: string; role: string } | null>(null);
  const [guestCount,setGuestCount]= useState(0);
  const [hasInited, setHasInited] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const lastUserMsg = useRef<ChatMessage | null>(null);

  // Init: fetch user + restore guest count
  useEffect(() => {
    const storedCount = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    setGuestCount(isNaN(storedCount) ? 0 : storedCount);

    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d?.user) setUser({ name: d.user.name, role: d.user.role });
      })
      .catch(() => {})
      .finally(() => setHasInited(true));
  }, []);

  // Inject welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0 && hasInited) {
      setMessages([makeWelcome(user?.role ?? null, user?.name ?? null)]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, hasInited]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isGuest       = !user;
  const remaining     = Math.max(0, GUEST_LIMIT - guestCount);
  const limitReached  = isGuest && guestCount >= GUEST_LIMIT;

  const sendMessage = useCallback(async (overrideMsg?: string) => {
    const text = (overrideMsg ?? input).trim();
    if (!text || loading) return;
    setError(null);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    lastUserMsg.current = userMsg;

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Update guest count
    const newGuestCount = isGuest ? guestCount + 1 : guestCount;
    if (isGuest) {
      setGuestCount(newGuestCount);
      localStorage.setItem(STORAGE_KEY, String(newGuestCount));
    }

    // Build history for API (exclude welcome message, keep user/assistant only)
    const history = newMessages
      .filter(m => m.id !== "welcome")
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`/api/chatbot/chat`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ messages: history, guestCount: newGuestCount }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? `Server error ${res.status}`);
      }

      const assistantMsg: ChatMessage = {
        id:      Date.now().toString() + "_a",
        role:    "assistant",
        content: data.data.content,
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error occurred";
      setError(message);
      // Rollback user message so they can retry
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      if (isGuest) {
        const rollback = newGuestCount - 1;
        setGuestCount(rollback);
        localStorage.setItem(STORAGE_KEY, String(rollback));
      }
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, guestCount, isGuest]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleRetry = () => {
    if (lastUserMsg.current) sendMessage(lastUserMsg.current.content);
  };

  const clearChat = () => {
    setMessages([makeWelcome(user?.role ?? null, user?.name ?? null)]);
    setError(null);
    setInput("");
    if (isGuest) { setGuestCount(0); localStorage.removeItem(STORAGE_KEY); }
  };

  const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
    ADMIN:    { bg: "rgba(90,120,200,0.25)",  text: "#90CAF9" },
    SELLER:   { bg: "rgba(74,124,89,0.25)",   text: "#A5D6A7" },
    CUSTOMER: { bg: "rgba(194,112,58,0.25)",  text: "#FFCC80" },
  };
  const roleStyle = user ? (ROLE_COLOR[user.role] ?? ROLE_COLOR.CUSTOMER) : null;

  return (
    <>
      {/* ── Floating trigger button ──────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[500] flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full
              shadow-2xl font-semibold text-sm text-white transition-transform hover:scale-105 active:scale-95"
            style={{
              background:  "linear-gradient(135deg,#1B3A5C 0%,#2d5a8e 100%)",
              boxShadow:   "0 8px 32px rgba(27,58,92,0.55), 0 2px 8px rgba(0,0,0,0.3)",
              border:      "1px solid rgba(255,255,255,0.12)",
            }}
            aria-label="Open LifeLineBot chat"
          >
            {/* Chat icon */}
            <span className="relative flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {/* Pulse dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: "#C2703A", boxShadow: "0 0 0 2px #1B3A5C" }}>
                <span className="absolute inset-0 rounded-full animate-ping opacity-75"
                  style={{ background: "#C2703A" }} />
              </span>
            </span>
            <span>LifeLineBot</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{ opacity: 0,   y: 40,  scale: 0.95  }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed bottom-6 right-6 z-[500] flex flex-col overflow-hidden"
            style={{
              width:        "min(420px, calc(100vw - 24px))",
              height:       "min(620px, calc(100vh - 40px))",
              borderRadius: "24px",
              background:   "linear-gradient(160deg,#0d2540 0%,#12304f 50%,#0a1f38 100%)",
              border:       "1px solid rgba(255,255,255,0.12)",
              boxShadow:    "0 24px 80px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.15)" }}>

              {/* Bot logo */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 relative"
                style={{ background: "linear-gradient(135deg,#1B3A5C,#3A6EA5)" }}>
                L
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
                  style={{ border: "2px solid #0d2540" }} />
              </div>

              {/* Title + user info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white leading-tight">LifeLineBot</p>
                  {user && roleStyle && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: roleStyle.bg, color: roleStyle.text }}>
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-[10px] leading-tight" style={{ color: "rgba(245,237,227,0.4)" }}>
                  {user ? `Hi, ${user.name.split(" ")[0]}` : "Guest · 4 free messages"}&nbsp;·&nbsp;Always here to help
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={clearChat}
                  title="Clear chat"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs"
                  style={{ color: "rgba(245,237,227,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  ↺
                </button>
                <button onClick={() => setIsOpen(false)}
                  title="Close"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-lg leading-none"
                  style={{ color: "rgba(245,237,227,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  ×
                </button>
              </div>
            </div>

            {/* ── Guest limit banner ───────────────────────────────────────── */}
            {isGuest && (
              <div className="flex-shrink-0 px-4 pt-3">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: remaining > 1 ? "rgba(194,112,58,0.1)" : "rgba(239,68,68,0.12)",
                    border: `1px solid ${remaining > 1 ? "rgba(194,112,58,0.2)" : "rgba(239,68,68,0.25)"}`,
                    color: remaining > 1 ? "#e8935e" : "#fca5a5",
                  }}>
                  <span>{remaining > 0 ? `${remaining} free message${remaining !== 1 ? "s" : ""} remaining` : "Guest limit reached"}</span>
                  <Link href="/login"
                    className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity flex-shrink-0 ml-2">
                    Sign in →
                  </Link>
                </div>
              </div>
            )}

            {/* ── Messages ─────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              {loading && <TypingDots />}
              {error && <ErrorBanner message={error} onRetry={handleRetry} />}
              <div ref={bottomRef} />
            </div>

            {/* ── Input area ───────────────────────────────────────────────── */}
            <div className="flex-shrink-0 px-4 pb-4 pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>

              {limitReached ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-center" style={{ color: "rgba(245,237,227,0.4)" }}>
                    You've used all guest messages. Sign in to continue.
                  </p>
                  <Link href="/login"
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#C2703A,#d4894e)" }}>
                    Sign in for unlimited access
                  </Link>
                </div>
              ) : (
                <div className="flex items-end gap-2"
                  style={{
                    background:   "rgba(255,255,255,0.06)",
                    border:       "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    padding:      "8px 12px",
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={loading ? "LifeLineBot is typing…" : "Ask anything about LifeLine…"}
                    disabled={loading || limitReached}
                    rows={1}
                    className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed
                      placeholder:text-white/25 disabled:opacity-50 max-h-28 overflow-y-auto"
                    style={{ color: "rgba(245,237,227,0.9)" }}
                    onInput={e => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 112) + "px";
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading || limitReached}
                    className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                      transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    style={{
                      background: input.trim() && !loading
                        ? "linear-gradient(135deg,#C2703A,#d4894e)"
                        : "rgba(255,255,255,0.08)",
                      color: "white",
                    }}
                    aria-label="Send message"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Footer */}
              <p className="text-center text-[10px] mt-2" style={{ color: "rgba(245,237,227,0.2)" }}>
                LifeLineBot · AI-powered · For guidance only — consult a pharmacist for medical decisions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
