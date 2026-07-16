import { useNavigate, useLocation } from "react-router";
import { Auth } from "../../app/components/Auth";
import { useAuth } from "../../app/AuthContext";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const goAfterAuth = (role?: string) => {
    if (role === "admin") navigate("/admin");
    else navigate(from === "/auth" ? "/" : from);
  };

  return (
    <Auth
      onBack={() => navigate("/")}
      onSignIn={async (input) => {
        const res = await signIn(input);
        if (res.ok) goAfterAuth(res.role);
        return res;
      }}
      onSignUp={async (input) => {
        const res = await signUp(input);
        if (res.ok) goAfterAuth(res.role);
        return res;
      }}
    />
  );
}
