import { messagesApi } from "@marketly/core";
import { toast } from "sonner";

type Nav = (path: string) => void;

/** Open or create a listing chat, then navigate to the thread. */
export async function startListingChat(
  listingId: number,
  opts: { isSignedIn: boolean; canMessage: boolean; navigate: Nav },
) {
  if (!opts.isSignedIn) {
    toast.message("Sign in to chat with the seller");
    opts.navigate(`/auth?next=${encodeURIComponent(`/listing/${listingId}`)}`);
    return;
  }
  if (!opts.canMessage) {
    toast.error("Messaging is disabled for your account");
    return;
  }
  const res = await messagesApi.openListingChat(listingId);
  if (!res.ok) {
    toast.error(res.error);
    return;
  }
  opts.navigate(`/chats/${res.data.id}`);
}

export async function startAuctionChat(
  input: {
    auctionId: string;
    title: string;
    img?: string;
    sellerId?: string;
    sellerName?: string;
  },
  opts: { isSignedIn: boolean; canMessage: boolean; navigate: Nav },
) {
  if (!opts.isSignedIn) {
    toast.message("Sign in to message the seller");
    opts.navigate(`/auth?next=${encodeURIComponent(`/auctions/${input.auctionId}`)}`);
    return;
  }
  if (!opts.canMessage) {
    toast.error("Messaging is disabled for your account");
    return;
  }
  const res = await messagesApi.openAuctionChat(input);
  if (!res.ok) {
    toast.error(res.error);
    return;
  }
  opts.navigate(`/chats/${res.data.id}`);
}
