import { useNavigate } from "react-router";
import { HelpCenter } from "../../app/components/HelpCenter";

export function HelpPage() {
  const navigate = useNavigate();
  return (
    <HelpCenter
      onBack={() => navigate("/")}
      onContact={() => navigate("/contact")}
    />
  );
}
