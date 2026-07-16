import { useNavigate } from "react-router";
import { AuctionDetail } from "../../app/components/AuctionDetail";
import { useAuth } from "../../app/AuthContext";

export function AuctionDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const { user, can } = useAuth();
  return (
    <AuctionDetail
      id={id}
      onBack={() => navigate("/auctions")}
      user={user ? { name: user.name, role: user.role } : null}
      onLogin={() => navigate("/auth")}
      canBid={Boolean(user && (user.role === "admin" || can("canBidInAuctions")))}
      canBrowse={Boolean(!user || user.role === "admin" || can("canBrowseAuctions"))}
    />
  );
}
