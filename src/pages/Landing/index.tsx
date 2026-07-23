import { useNavigate } from "react-router";
import { Landing } from "../../app/components/Landing";
import { useAuth } from "../../app/AuthContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const onNavigate = (p: string, ps: Record<string, string> = {}) => {
    const qs = new URLSearchParams(ps).toString();
    if (p === "browse") {
      navigate(qs ? `/browse?${qs}` : "/browse");
      return;
    }
    if (p === "detail" && ps.id) {
      navigate(`/listing/${ps.id}`);
      return;
    }
    if (p === "auction") {
      navigate("/auctions");
      return;
    }
    if (p === "auction-detail" && ps.id) {
      navigate(`/auctions/${ps.id}`);
      return;
    }
    if (p === "post") {
      navigate("/post");
      return;
    }
    if (p === "auth") {
      navigate("/auth");
      return;
    }
    if (p === "admin") {
      navigate("/admin");
      return;
    }
    if (p === "chats") {
      navigate("/chats");
      return;
    }
    if (p === "mobile-android") {
      navigate("/preview/android");
      return;
    }
    if (p === "mobile-ios") {
      navigate("/preview/ios");
      return;
    }
    navigate("/");
  };

  return (
    <Landing
      onNavigate={onNavigate}
      user={user ? { name: user.name, role: user.role } : null}
      onLogout={() => void logout()}
    />
  );
}
