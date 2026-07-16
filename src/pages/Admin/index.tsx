import { useNavigate } from "react-router";
import { AdminPanel } from "../../app/components/AdminPanel";
import { useAuth } from "../../app/AuthContext";

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (!user) return null;
  return (
    <AdminPanel
      admin={{ name: user.name }}
      onBack={() => navigate("/")}
      onViewAuction={(id) => navigate(`/auctions/${id}`)}
    />
  );
}
