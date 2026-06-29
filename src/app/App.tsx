import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "sonner";
import "./i18n";
import { AppProvider, useApp } from "./AppContext";
import { ElementsProvider, useElements } from "./ElementsContext";
import { Landing } from "./components/Landing";
import { Auth } from "./components/Auth";
import { Browse } from "./components/Browse";
import { Detail } from "./components/Detail";
import { LiveEditIndicator } from "./components/LiveEditIndicator";
import { useHashRoute } from "./hooks";

const PostAd = lazy(() => import("./components/PostAd").then((m) => ({ default: m.PostAd })));
const AdminPanel = lazy(() => import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel })));

type Page = "landing" | "auth" | "post" | "browse" | "detail" | "admin";
type User = { name: string; role: "customer" | "dealer" | "admin"; phone?: string } | null;

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="size-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );
}

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
    if (p === "post" && !user) { nav("auth"); return; }
    if (p === "admin" && user?.role !== "admin") return;
    nav(p, ps);
  };

  return (
    <>
      <Toaster theme={theme} position="top-center" richColors />
      <LiveEditIndicator />
      <Suspense fallback={<PageFallback />}>
        {page === "auth" && (
          <Auth onBack={() => nav("landing")} onLogin={(u) => { setUser(u); nav("landing"); }} />
        )}
        {page === "post" && <PostAd onBack={() => nav("landing")} />}
        {page === "browse" && (
          <Browse
            initial={params}
            onBack={() => nav("landing")}
            onOpen={(id) => nav("detail", { id: String(id) })}
          />
        )}
        {page === "admin" && user?.role === "admin" && (
          <AdminPanel admin={{ name: user.name }} onBack={() => nav("landing")} />
        )}
        {page === "detail" && (
          <Detail
            id={Number(params.id) || 1}
            onBack={() => nav("browse")}
            onOpen={(id) => nav("detail", { id: String(id) })}
          />
        )}
        {page === "landing" && (
          <Landing onNavigate={navigate} user={user} onLogout={() => setUser(null)} />
        )}
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ElementsProvider>
        <Shell />
      </ElementsProvider>
    </AppProvider>
  );
}
