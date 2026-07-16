import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import "./i18n";
import { AppProvider, useApp } from "./AppContext";
import { ElementsProvider } from "./ElementsContext";
import { AuctionProvider } from "./AuctionContext";
import { CatalogProvider } from "./PostAdCatalogContext";
import { AuthProvider } from "./AuthContext";
import { AppRoutes } from "./router";
import { LiveEditIndicator } from "./components/LiveEditIndicator";

function Shell() {
  const { theme } = useApp();
  return (
    <>
      <Toaster theme={theme} position="top-center" richColors />
      <LiveEditIndicator />
      <AppRoutes />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <CatalogProvider>
            <ElementsProvider>
              <AuctionProvider>
                <Shell />
              </AuctionProvider>
            </ElementsProvider>
          </CatalogProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
