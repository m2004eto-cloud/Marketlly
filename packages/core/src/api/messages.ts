import { fail, ok, withLatency, type ApiResult } from "./client";
import { readJson, writeJson } from "../storage";
import { getAllListingsSync } from "./listings";
import { getSessionSync, listAccountsSync } from "./auth";

const KEY = "marketly_conversations_v1";
const listeners = new Set<() => void>();

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
  readBy: string[];
};

export type Conversation = {
  id: string;
  listingId?: number;
  auctionId?: string;
  subject: string;
  listingImg?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessage: string;
  lastMessageAt: number;
  createdAt: number;
  messages: ChatMessage[];
};

type Store = { conversations: Conversation[] };

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeMessages(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function load(): Store {
  const stored = readJson<Store | null>(KEY, null);
  if (!stored || !Array.isArray(stored.conversations)) {
    return { conversations: [] };
  }
  return stored;
}

function save(store: Store) {
  writeJson(KEY, store);
  notify();
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Map demo / seed owners onto real seeded dealer accounts. */
export function resolveSellerAccount(ownerId?: string, ownerName?: string): {
  id: string;
  name: string;
  phone?: string;
  verified: boolean;
} {
  const accounts = listAccountsSync();
  if (ownerId) {
    const byId = accounts.find((a) => a.id === ownerId);
    if (byId) {
      return {
        id: byId.id,
        name: byId.name,
        phone: byId.phone,
        verified: byId.verified,
      };
    }
  }
  if (ownerName) {
    const byName = accounts.find((a) => a.name.toLowerCase() === ownerName.toLowerCase());
    if (byName) {
      return {
        id: byName.id,
        name: byName.name,
        phone: byName.phone,
        verified: byName.verified,
      };
    }
  }
  // Seed listings + demo auction sellers → primary demo dealer
  const dealer =
    accounts.find((a) => a.id === "dealer-1") ||
    accounts.find((a) => a.role === "dealer" && !a.banned) ||
    accounts.find((a) => a.role === "admin");
  return {
    id: dealer?.id || "dealer-1",
    name: ownerName || dealer?.name || "Marketly Dealer",
    phone: dealer?.phone,
    verified: dealer?.verified ?? true,
  };
}

function requireMessenger() {
  const session = getSessionSync();
  if (!session) return { ok: false as const, error: "Sign in to chat with sellers" };
  if (session.banned) return { ok: false as const, error: "Your account is suspended" };
  if (!session.permissions.canMessage) {
    return { ok: false as const, error: "Messaging is disabled for your account" };
  }
  return { ok: true as const, session };
}

function participantIds(c: Conversation): string[] {
  return [c.buyerId, c.sellerId];
}

function isParticipant(c: Conversation, userId: string) {
  return participantIds(c).includes(userId);
}

function otherParty(c: Conversation, userId: string) {
  if (userId === c.buyerId) return { id: c.sellerId, name: c.sellerName };
  return { id: c.buyerId, name: c.buyerName };
}

function toPublicConversation(c: Conversation, userId: string) {
  const unread = c.messages.filter(
    (m) => m.senderId !== userId && !m.readBy.includes(userId),
  ).length;
  const peer = otherParty(c, userId);
  return {
    id: c.id,
    listingId: c.listingId,
    auctionId: c.auctionId,
    subject: c.subject,
    listingImg: c.listingImg,
    peerId: peer.id,
    peerName: peer.name,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt,
    createdAt: c.createdAt,
    unread,
    role: userId === c.buyerId ? ("buyer" as const) : ("seller" as const),
  };
}

export type PublicConversation = ReturnType<typeof toPublicConversation>;

export function listConversationsSync(): PublicConversation[] {
  const gate = requireMessenger();
  if (!gate.ok) return [];
  const { session } = gate;
  return load()
    .conversations
    .filter((c) => isParticipant(c, session.id))
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
    .map((c) => toPublicConversation(c, session.id));
}

export async function listConversations(): Promise<ApiResult<PublicConversation[]>> {
  return withLatency(() => {
    const gate = requireMessenger();
    if (!gate.ok) return fail(gate.error);
    return ok(listConversationsSync());
  }, 0);
}

export function getUnreadCountSync(): number {
  return listConversationsSync().reduce((n, c) => n + c.unread, 0);
}

export function getMessagesSync(conversationId: string): ChatMessage[] {
  const gate = requireMessenger();
  if (!gate.ok) return [];
  const c = load().conversations.find((x) => x.id === conversationId);
  if (!c || !isParticipant(c, gate.session.id)) return [];
  return [...c.messages].sort((a, b) => a.createdAt - b.createdAt);
}

export async function getMessages(conversationId: string): Promise<ApiResult<ChatMessage[]>> {
  return withLatency(() => {
    const gate = requireMessenger();
    if (!gate.ok) return fail(gate.error);
    const c = load().conversations.find((x) => x.id === conversationId);
    if (!c) return fail("Conversation not found");
    if (!isParticipant(c, gate.session.id)) return fail("Not allowed");
    return ok(getMessagesSync(conversationId));
  }, 0);
}

export async function markConversationRead(conversationId: string): Promise<ApiResult<true>> {
  return withLatency(() => {
    const gate = requireMessenger();
    if (!gate.ok) return fail(gate.error);
    const store = load();
    const idx = store.conversations.findIndex((c) => c.id === conversationId);
    if (idx < 0) return fail("Conversation not found");
    const c = store.conversations[idx];
    if (!isParticipant(c, gate.session.id)) return fail("Not allowed");
    const uid = gate.session.id;
    store.conversations[idx] = {
      ...c,
      messages: c.messages.map((m) =>
        m.readBy.includes(uid) ? m : { ...m, readBy: [...m.readBy, uid] },
      ),
    };
    save(store);
    return ok(true);
  }, 0);
}

function findExisting(
  store: Store,
  opts: { buyerId: string; sellerId: string; listingId?: number; auctionId?: string },
): Conversation | undefined {
  return store.conversations.find((c) => {
    if (c.buyerId !== opts.buyerId || c.sellerId !== opts.sellerId) return false;
    if (opts.listingId != null) return c.listingId === opts.listingId;
    if (opts.auctionId != null) return c.auctionId === opts.auctionId;
    return false;
  });
}

export async function openListingChat(listingId: number): Promise<ApiResult<PublicConversation>> {
  return withLatency(() => {
    const gate = requireMessenger();
    if (!gate.ok) return fail(gate.error);
    const listing = getAllListingsSync().find((l) => l.id === listingId);
    if (!listing) return fail("Listing not found");

    const seller = resolveSellerAccount(listing.ownerId, listing.ownerName);
    if (seller.id === gate.session.id) {
      return fail("You cannot chat with yourself on your own listing");
    }

    const store = load();
    const existing = findExisting(store, {
      buyerId: gate.session.id,
      sellerId: seller.id,
      listingId,
    });
    if (existing) {
      return ok(toPublicConversation(existing, gate.session.id));
    }

    const now = Date.now();
    const greeting: ChatMessage = {
      id: uid("msg"),
      conversationId: "",
      senderId: "system",
      body: `Chat started about “${listing.title}”. Be polite and keep payments on the platform.`,
      createdAt: now,
      readBy: [gate.session.id, seller.id],
    };
    const conversation: Conversation = {
      id: uid("conv"),
      listingId,
      subject: listing.title,
      listingImg: listing.img,
      buyerId: gate.session.id,
      buyerName: gate.session.name,
      sellerId: seller.id,
      sellerName: seller.name,
      lastMessage: greeting.body,
      lastMessageAt: now,
      createdAt: now,
      messages: [{ ...greeting, conversationId: "" }],
    };
    conversation.messages[0].conversationId = conversation.id;
    store.conversations.unshift(conversation);
    save(store);
    return ok(toPublicConversation(conversation, gate.session.id));
  }, 0);
}

export async function openAuctionChat(input: {
  auctionId: string;
  title: string;
  img?: string;
  sellerId?: string;
  sellerName?: string;
}): Promise<ApiResult<PublicConversation>> {
  return withLatency(() => {
    const gate = requireMessenger();
    if (!gate.ok) return fail(gate.error);

    const seller = resolveSellerAccount(input.sellerId, input.sellerName);
    if (seller.id === gate.session.id) {
      return fail("You cannot chat with yourself on your own auction");
    }

    const store = load();
    const existing = findExisting(store, {
      buyerId: gate.session.id,
      sellerId: seller.id,
      auctionId: input.auctionId,
    });
    if (existing) {
      return ok(toPublicConversation(existing, gate.session.id));
    }

    const now = Date.now();
    const greeting: ChatMessage = {
      id: uid("msg"),
      conversationId: "",
      senderId: "system",
      body: `Chat started about auction “${input.title}”.`,
      createdAt: now,
      readBy: [gate.session.id, seller.id],
    };
    const conversation: Conversation = {
      id: uid("conv"),
      auctionId: input.auctionId,
      subject: input.title,
      listingImg: input.img,
      buyerId: gate.session.id,
      buyerName: gate.session.name,
      sellerId: seller.id,
      sellerName: seller.name,
      lastMessage: greeting.body,
      lastMessageAt: now,
      createdAt: now,
      messages: [{ ...greeting }],
    };
    conversation.messages[0].conversationId = conversation.id;
    store.conversations.unshift(conversation);
    save(store);
    return ok(toPublicConversation(conversation, gate.session.id));
  }, 0);
}

export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<ApiResult<ChatMessage>> {
  return withLatency(() => {
    const gate = requireMessenger();
    if (!gate.ok) return fail(gate.error);
    const text = body.trim();
    if (!text) return fail("Message cannot be empty");
    if (text.length > 2000) return fail("Message is too long");

    const store = load();
    const idx = store.conversations.findIndex((c) => c.id === conversationId);
    if (idx < 0) return fail("Conversation not found");
    const c = store.conversations[idx];
    if (!isParticipant(c, gate.session.id)) return fail("Not allowed");

    const msg: ChatMessage = {
      id: uid("msg"),
      conversationId,
      senderId: gate.session.id,
      body: text,
      createdAt: Date.now(),
      readBy: [gate.session.id],
    };
    const updated: Conversation = {
      ...c,
      messages: [...c.messages, msg],
      lastMessage: text,
      lastMessageAt: msg.createdAt,
    };
    store.conversations[idx] = updated;
    // Move to top
    store.conversations.splice(idx, 1);
    store.conversations.unshift(updated);
    save(store);

    // Demo: if peer is a seed dealer and never replied, auto-reply once
    maybeAutoReply(updated.id, gate.session.id);

    return ok(msg);
  }, 0);
}

function maybeAutoReply(conversationId: string, senderId: string) {
  // Defer so UI can render the buyer message first
  setTimeout(() => {
    const store = load();
    const idx = store.conversations.findIndex((c) => c.id === conversationId);
    if (idx < 0) return;
    const c = store.conversations[idx];
    const peerId = senderId === c.buyerId ? c.sellerId : c.buyerId;
    // Only auto-reply for seeded dealers when they have no human reply yet
    if (peerId !== "dealer-1" && peerId !== "dealer-2") return;
    const humanFromSeller = c.messages.some(
      (m) => m.senderId === peerId && m.senderId !== "system",
    );
    if (humanFromSeller) return;
    const buyerMsgs = c.messages.filter((m) => m.senderId === c.buyerId);
    if (buyerMsgs.length !== 1) return;

    const reply: ChatMessage = {
      id: uid("msg"),
      conversationId,
      senderId: peerId,
      body: `Thanks for your interest in “${c.subject}”. It's still available — happy to arrange a viewing. When works for you?`,
      createdAt: Date.now(),
      readBy: [peerId],
    };
    const updated: Conversation = {
      ...c,
      messages: [...c.messages, reply],
      lastMessage: reply.body,
      lastMessageAt: reply.createdAt,
    };
    store.conversations[idx] = updated;
    save(store);
  }, 900);
}

export async function getConversation(
  conversationId: string,
): Promise<ApiResult<PublicConversation>> {
  return withLatency(() => {
    const gate = requireMessenger();
    if (!gate.ok) return fail(gate.error);
    const c = load().conversations.find((x) => x.id === conversationId);
    if (!c) return fail("Conversation not found");
    if (!isParticipant(c, gate.session.id)) return fail("Not allowed");
    return ok(toPublicConversation(c, gate.session.id));
  }, 0);
}
