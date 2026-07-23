import { useNavigate, useParams } from "react-router";
import { Chats } from "../../app/components/Chats";

export function ChatsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <Chats
      initialConversationId={id}
      onBack={() => navigate(-1)}
      onOpenListing={(listingId) => navigate(`/listing/${listingId}`)}
    />
  );
}
