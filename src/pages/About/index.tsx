import { useNavigate } from "react-router";
import { AboutUs } from "../../app/components/AboutUs";

export function AboutPage() {
  const navigate = useNavigate();
  return <AboutUs onBack={() => navigate("/")} />;
}
