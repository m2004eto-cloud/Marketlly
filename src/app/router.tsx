import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useElements } from "./ElementsContext";
import { LandingPage } from "../pages/Landing";
import { AuthPage } from "../pages/Auth";
import { BrowsePage } from "../pages/Browse";
import { DetailPage } from "../pages/Detail";
import { PostAdPage } from "../pages/PostAd";
import { AdminPage } from "../pages/Admin";
import { AuctionListPage } from "../pages/AuctionList";
import { AuctionDetailPage } from "../pages/AuctionDetail";
import { MobilePreviewPage } from "../pages/MobilePreview";
import { ChatsPage } from "../pages/Chats";
import { AboutPage } from "../pages/About";
import { ContactPage } from "../pages/Contact";
import { HelpPage } from "../pages/Help";
import { SitemapPage } from "../pages/Sitemap";

function HashRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;
    const [path, query = ""] = raw.split("?");
    const map: Record<string, string> = {
      landing: "/",
      auth: "/auth",
      post: "/post",
      browse: "/browse",
      detail: "/listing",
      admin: "/admin",
      chats: "/chats",
      auction: "/auctions",
      "auction-detail": "/auctions",
      "mobile-android": "/preview/android",
      "mobile-ios": "/preview/ios",
    };
    const params = new URLSearchParams(query);
    let to = map[path] || "/";
    if (path === "detail" && params.get("id")) to = `/listing/${params.get("id")}`;
    if (path === "auction-detail" && params.get("id")) to = `/auctions/${params.get("id")}`;
    if (path === "browse") {
      params.delete("id");
      const qs = params.toString();
      to = qs ? `/browse?${qs}` : "/browse";
    }
    window.location.hash = "";
    navigate(to, { replace: true });
  }, [navigate]);
  return null;
}

function RequireAuth() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}

function RequireAdmin() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

function AdminSync() {
  const { user } = useAuth();
  const { setAdmin, setEditMode } = useElements();
  useEffect(() => {
    const isAdmin = user?.role === "admin";
    setAdmin(!!isAdmin);
    if (!isAdmin) setEditMode(false);
  }, [user, setAdmin, setEditMode]);
  return <Outlet />;
}

function DetailRoute() {
  const { id } = useParams();
  return <DetailPage id={Number(id) || 0} />;
}

function AuctionDetailRoute() {
  const { id } = useParams();
  return <AuctionDetailPage id={id || ""} />;
}

function BrowseRoute() {
  const [sp] = useSearchParams();
  const initial = useMemo(() => {
    const o: Record<string, string> = {};
    sp.forEach((v, k) => {
      o[k] = v;
    });
    return o;
  }, [sp]);
  return <BrowsePage initial={initial} />;
}

export function AppRoutes() {
  return (
    <>
      <HashRedirect />
      <Routes>
        <Route element={<AdminSync />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/browse" element={<BrowseRoute />} />
          <Route path="/listing/:id" element={<DetailRoute />} />
          <Route path="/auctions" element={<AuctionListPage />} />
          <Route path="/auctions/:id" element={<AuctionDetailRoute />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="/preview/android" element={<MobilePreviewPage platform="android" />} />
          <Route path="/preview/ios" element={<MobilePreviewPage platform="ios" />} />
          <Route element={<RequireAuth />}>
            <Route path="/post" element={<PostAdPage />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/chats/:id" element={<ChatsPage />} />
          </Route>
          <Route element={<RequireAdmin />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
