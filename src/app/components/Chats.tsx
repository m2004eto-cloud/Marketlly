import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, MessageCircle, Send, Search, Image as ImageIcon, BadgeCheck, Loader2,
} from "lucide-react";
import {
  messagesApi,
  type ChatMessage,
  type PublicConversation,
} from "@marketly/core";
import { useAuth } from "../AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { HeaderControls } from "./HeaderControls";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type Props = {
  initialConversationId?: string;
  onBack: () => void;
  onOpenListing?: (id: number) => void;
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function Chats({ initialConversationId, onBack, onOpenListing }: Props) {
  const { t } = useTranslation();
  const { user, can } = useAuth();
  const [conversations, setConversations] = useState<PublicConversation[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(initialConversationId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [q, setQ] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshList = () => setConversations(messagesApi.listConversationsSync());

  const loadThread = async (id: string) => {
    const res = await messagesApi.getMessages(id);
    if (res.ok) setMessages(res.data);
    await messagesApi.markConversationRead(id);
    refreshList();
  };

  useEffect(() => {
    if (!user || !can("canMessage")) {
      setLoading(false);
      return;
    }
    refreshList();
    setLoading(false);
    return messagesApi.subscribeMessages(() => {
      refreshList();
      if (activeId) {
        void loadThread(activeId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeId]);

  useEffect(() => {
    if (initialConversationId) setActiveId(initialConversationId);
  }, [initialConversationId]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    void loadThread(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter(
      (c) =>
        c.peerName.toLowerCase().includes(term) ||
        c.subject.toLowerCase().includes(term) ||
        c.lastMessage.toLowerCase().includes(term),
    );
  }, [conversations, q]);

  const active = conversations.find((c) => c.id === activeId) || filtered.find((c) => c.id === activeId);

  const send = async () => {
    if (!activeId || !draft.trim() || sending) return;
    setSending(true);
    const res = await messagesApi.sendMessage(activeId, draft);
    setSending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDraft("");
    await loadThread(activeId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-950">
        <MessageCircle className="size-10 text-slate-400" />
        <p className="font-medium">Sign in to use chat</p>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Go back</button>
      </div>
    );
  }

  if (!can("canMessage")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-950">
        <MessageCircle className="size-10 text-slate-400" />
        <p className="font-medium">Messaging is disabled for your account</p>
        <p className="text-sm text-slate-500">Contact support or an admin to enable chat.</p>
        <button onClick={onBack} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (activeId && window.innerWidth < 768 ? setActiveId(undefined) : onBack())}
            className="size-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold tracking-tight flex items-center gap-2">
              <MessageCircle className="size-4 text-blue-600" />
              {t("nav.chats")}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {active ? `Chat with ${active.peerName}` : "Buyer ↔ seller messaging"}
            </p>
          </div>
          <HeaderControls />
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-0 md:px-4 py-0 md:py-4 grid md:grid-cols-[320px_1fr] gap-0 md:gap-4 min-h-0">
        {/* Inbox */}
        <aside
          className={`bg-white dark:bg-slate-900 md:rounded-2xl border-y md:border border-slate-200 dark:border-slate-800 flex flex-col min-h-[50vh] md:min-h-[70vh] ${
            activeId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search chats…"
                className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center text-slate-400"><Loader2 className="size-5 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                <MessageCircle className="size-8 mx-auto mb-2 opacity-40" />
                No conversations yet.
                <p className="text-xs mt-1">Open a listing and tap “Chat with seller”.</p>
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex items-start gap-3 px-3 py-3 text-start border-b border-slate-50 dark:border-slate-800/80 transition ${
                    activeId === c.id ? "bg-blue-50 dark:bg-blue-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="size-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    {c.listingImg ? (
                      <ImageWithFallback src={c.listingImg} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{c.peerName}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{formatTime(c.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.subject}</p>
                    <p className={`text-xs truncate mt-0.5 ${c.unread ? "text-slate-900 dark:text-slate-100 font-medium" : "text-slate-400"}`}>
                      {c.lastMessage}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="mt-1 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Thread */}
        <section
          className={`bg-white dark:bg-slate-900 md:rounded-2xl border-y md:border border-slate-200 dark:border-slate-800 flex flex-col min-h-[60vh] md:min-h-[70vh] ${
            activeId ? "flex" : "hidden md:flex"
          }`}
        >
          {!activeId || !active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <MessageCircle className="size-12 mb-3 opacity-40" />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold">
                  {active.peerName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm flex items-center gap-1 truncate">
                    {active.peerName}
                    <BadgeCheck className="size-3.5 text-blue-600 shrink-0" />
                  </p>
                  <p className="text-xs text-slate-500 truncate">{active.subject}</p>
                </div>
                {active.listingId && onOpenListing && (
                  <button
                    type="button"
                    onClick={() => onOpenListing(active.listingId!)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    View ad
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const mine = m.senderId === user.id;
                  const system = m.senderId === "system";
                  if (system) {
                    return (
                      <div key={m.id} className="flex justify-center">
                        <p className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full max-w-[90%] text-center">
                          {m.body}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                          mine
                            ? "bg-blue-600 text-white rounded-ee-md"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-es-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-slate-400"}`}>
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form
                className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="size-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
                  aria-label="Send"
                >
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
