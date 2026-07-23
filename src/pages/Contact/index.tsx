import { useNavigate, useSearchParams } from "react-router";
import { ContactUs } from "../../app/components/ContactUs";

export function ContactPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  return (
    <ContactUs
      onBack={() => navigate("/")}
      reason={sp.get("reason") || undefined}
    />
  );
}
