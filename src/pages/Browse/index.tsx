import { useNavigate } from "react-router";
import { Browse } from "../../app/components/Browse";

export function BrowsePage({ initial }: { initial: Record<string, string> }) {
  const navigate = useNavigate();
  return (
    <Browse
      initial={initial}
      onBack={() => navigate("/")}
      onOpen={(id) => navigate(`/listing/${id}`)}
    />
  );
}
