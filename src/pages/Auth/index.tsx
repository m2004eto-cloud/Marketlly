import { useNavigate, useLocation } from "react-router";
import { Auth } from "../../app/components/Auth";
import { useAuth } from "../../app/AuthContext";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = (location.state as { from?: string } | null)?.from || "/";

  return (
    <Auth
      onBack={() => navigate("/")}
      onLogin={async (u) => {
        const ok = await login({
          email: u.email,
          password: u.password,
          name: u.name,
          role: u.role,
        });
        if (ok) navigate(u.role === "admin" ? "/admin" : from === "/auth" ? "/" : from);
      }}
    />
  );
}
