import { useNavigate } from "react-router";
import { Sitemap } from "../../app/components/Sitemap";

export function SitemapPage() {
  const navigate = useNavigate();
  return (
    <Sitemap
      onBack={() => navigate("/")}
      onNavigate={(path) => navigate(path)}
    />
  );
}
