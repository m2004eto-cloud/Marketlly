import { useEffect, useState, startTransition } from "react";
import { Toaster } from "sonner";
import "./i18n";
import { AppProvider, useApp } from "./AppContext";
import { ElementsProvider, useElements } from "./ElementsContext";
import { AuctionProvider } from "./AuctionContext";
import { Landing } from "./components/Landing";
import { Auth } from "./components/Auth";
import { Browse } from "./components/Browse";
import { Detail } from "./components/Detail";
import { LiveEditIndicator } from "./components/LiveEditIndicator";
import { AuctionList } from "./components/AuctionList";
import { AuctionDetail } from "./components/AuctionDetail";
import { PostAd } from "./components/PostAd";
import { AdminPanel } from "./components/AdminPanel";
import { MobileAppAndroid } from "./components/MobileAppAndroid";
import { MobileAppIOS } from "./components/MobileAppIOS";
import { CatalogProvider } from "./PostAdCatalogContext";
import { useHashRoute } from "./hooks";

type Page = "landing" | "auth" | "post" | "browse" | "detail" | "admin" | "auction" | "auction-detail" | "mobile-android" | "mobile-ios";
type User = { name: string; role: "customer" | "dealer" | "admin" } | null;

function Shell() {
  const { route, navigate: nav } = useHashRoute();
  const [user, setUser] = useState<User>(null);
  const { theme } = useApp();
  const { setAdmin, setEditMode } = useElements();

  const page = (route.path as Page) || "landing";
  const params = route.params;

  useEffect(() => {
    const isAdmin = user?.role === "admin";
    setAdmin(isAdmin);
    if (!isAdmin) setEditMode(false);
  }, [user, setAdmin, setEditMode]);

  const navigate = (p: string, ps: Record<string, string> = {}) => {
    if (p === "post" && !user) { startTransition(() => nav("auth")); return; }
    if (p === "admin" && user?.role !== "admin") return;
    startTransition(() => nav(p, ps));
  };

  return (
    <>
      <Toaster theme={theme} position="top-center" richColors />
      <LiveEditIndicator />
      {page === "auth" && (
        <Auth onBack={() => startTransition(() => nav("landing"))} onLogin={(u) => { setUser(u); startTransition(() => nav("landing")); }} />
      )}
      {page === "post" && <PostAd onBack={() => startTransition(() => nav("landing"))} />}
      {page === "browse" && (
        <Browse
          initial={params}
          onBack={() => startTransition(() => nav("landing"))}
          onOpen={(id) => startTransition(() => nav("detail", { id: String(id) }))}
        />
      )}
      {page === "admin" && user?.role === "admin" && (
        <AdminPanel
          admin={{ name: user.name }}
          onBack={() => startTransition(() => nav("landing"))}
          onViewAuction={(id) => startTransition(() => nav("auction-detail", { id }))}
        />
      )}
      {page === "detail" && (
        <Detail
          id={Number(params.id) || 1}
          onBack={() => startTransition(() => nav("browse"))}
          onOpen={(id) => startTransition(() => nav("detail", { id: String(id) }))}
        />
      )}
      {page === "auction" && (
        <AuctionList
          onBack={() => startTransition(() => nav("landing"))}
          onOpen={(id) => startTransition(() => nav("auction-detail", { id }))}
        />
      )}
      {page === "auction-detail" && (
        <AuctionDetail
          id={params.id || ""}
          onBack={() => startTransition(() => nav("auction"))}
          user={user}
          onLogin={() => startTransition(() => nav("auth"))}
        />
      )}
      {page === "mobile-android" && <MobileAppAndroid />}
      {page === "mobile-ios" && <MobileAppIOS />}
      {page === "landing" && (
        <Landing onNavigate={navigate} user={user} onLogout={() => setUser(null)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CatalogProvider>
        <ElementsProvider>
          <AuctionProvider>
            <Shell />
          </AuctionProvider>
        </ElementsProvider>
      </CatalogProvider>
    </AppProvider>
  );
}
