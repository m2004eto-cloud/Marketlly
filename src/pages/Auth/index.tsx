import { useNavigate, useLocation, useSearchParams } from "react-router";
import { Auth } from "../../app/components/Auth";
import { useAuth } from "../../app/AuthContext";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sp] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const fromState = (location.state as { from?: string } | null)?.from;
  const fromQuery = sp.get("next");
  const from = fromQuery || fromState || "/";

  const goAfterAuth = (role?: string) => {
    if (role === "admin" && (!fromQuery || from === "/")) navigate("/admin");
    else navigate(from === "/auth" ? "/" : from);
  };

  return (
    <Auth
      onBack={() => navigate("/")}
      onOpenLegal={(doc) => navigate(`/legal/${doc}`)}
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
