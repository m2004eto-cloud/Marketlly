import { useNavigate } from "react-router";
import { AuctionList } from "../../app/components/AuctionList";

export function AuctionListPage() {
  const navigate = useNavigate();
  return (
    <AuctionList
      onBack={() => navigate("/")}
      onOpen={(id) => navigate(`/auctions/${id}`)}
    />
  );
}
