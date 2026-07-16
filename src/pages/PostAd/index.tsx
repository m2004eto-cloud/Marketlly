import { useNavigate } from "react-router";
import { PostAd } from "../../app/components/PostAd";

export function PostAdPage() {
  const navigate = useNavigate();
  return <PostAd onBack={() => navigate("/")} onCreated={(id) => navigate(`/listing/${id}`)} />;
}
