import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, LayoutDashboard, FileText, Users, Flag, BarChart3, Settings,
  Search, CheckCircle2, XCircle, Trash2, Eye, ShieldCheck, ShieldOff,
  TrendingUp, DollarSign, Tag, AlertTriangle, Ban, UserCheck,
  Activity, Zap, Globe2, Building2, User as UserIcon, Sparkles, Clock, ArrowUpRight, ArrowDownRight,
  Wand2, Car, Smartphone, MapPin, MessageCircle, Image as ImageIcon, Heart, MousePointerClick, Gavel,
  ChevronRight, X, Edit3, Shield, Plus, Mail, Phone, Calendar, Download, Bell,
  Layers, Monitor, Sliders, Info, UserPlus, CreditCard, Percent, Landmark, Package,
  RefreshCw, Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { HeaderControls } from "./HeaderControls";
import {
  listingsApi,
  authApi,
  DEFAULT_CUSTOMER_PERMISSIONS,
  DEFAULT_DEALER_PERMISSIONS,
  BANNED_PERMISSIONS,
  type Listing,
  type ListingStatus as CoreListingStatus,
  type FrontendPermissions,
} from "@marketly/core";
import { ElementsEditor } from "./ElementsEditor";
import { useElements } from "../ElementsContext";
import { AuctionAdmin } from "./AuctionAdmin";
import { useAuction, getStatus } from "../AuctionContext";
import { FinancialModule } from "./FinancialModule";
import { ReportsModule } from "./ReportsModule";
import { CatalogEditor } from "./CatalogEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = { onBack: () => void; admin: { name: string }; onViewAuction?: (id: string) => void };
type Tab =
  | "dashboard" | "listings" | "auction" | "reports"
  | "users" | "dealers"
  | "financial"
  | "analytics" | "frontend" | "elements" | "catalog"
  | "settings";
type ListingStatus = CoreListingStatus;
type AdminListing = Listing & { seller: string; sellerRole: "customer" | "dealer" };

type UserPermissions = FrontendPermissions;

type AdminUser = {
  id: number; name: string; email: string; phone: string;
  role: "customer" | "dealer" | "admin";
  verified: boolean; banned: boolean; kycStatus: "none" | "pending" | "verified";
  ads: number; joined: string; lastActive: string; location: string; notes: string;
  permissions: UserPermissions;
};

type Report = {
  id: number; listingId: number; reason: string;
  reporter: string; date: string; status: "open" | "resolved";
};

type GlobalFrontendSettings = {
  showHeroBanner: boolean; showFeaturedListings: boolean;
  showMotorsCategory: boolean; showClassifiedsCategory: boolean; showAuctionsModule: boolean;
  showMessagingFeature: boolean; showWishlistFeature: boolean; showPricingToGuests: boolean;
  allowGuestBrowsing: boolean; maintenanceMode: boolean; maintenanceBanner: string;
  maxPhotosPerAd: number; requirePhoneVerification: boolean; autoApproveDealerAds: boolean;
};

// ─── Permission Presets ───────────────────────────────────────────────────────

const DEFAULT_CUSTOMER_PERMS: UserPermissions = { ...DEFAULT_CUSTOMER_PERMISSIONS };
const DEFAULT_DEALER_PERMS: UserPermissions = { ...DEFAULT_DEALER_PERMISSIONS };
const BANNED_PERMS: UserPermissions = { ...BANNED_PERMISSIONS };

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedUsers: AdminUser[] = [
  { id: 1, name: "Ahmed Al Mansoori", email: "ahmed@example.ae", phone: "+971 50 123 4567", role: "dealer", verified: true, banned: false, kycStatus: "verified", ads: 24, joined: "2025-08-12", lastActive: "2026-07-15", location: "Dubai", notes: "Premium Motors partner. Top seller Q1-Q2 2026.", permissions: DEFAULT_DEALER_PERMS },
  { id: 2, name: "Sara Khan", email: "sara.k@example.com", phone: "+971 55 987 6543", role: "customer", verified: false, banned: false, kycStatus: "pending", ads: 3, joined: "2026-01-04", lastActive: "2026-07-10", location: "Abu Dhabi", notes: "", permissions: DEFAULT_CUSTOMER_PERMS },
  { id: 3, name: "Premium Motors LLC", email: "sales@premiummotors.ae", phone: "+971 4 321 0987", role: "dealer", verified: true, banned: false, kycStatus: "verified", ads: 87, joined: "2024-11-20", lastActive: "2026-07-16", location: "Dubai", notes: "Enterprise account. Dedicated account manager: Rania.", permissions: { ...DEFAULT_DEALER_PERMS, maxAdsPerMonth: 500 } },
  { id: 4, name: "Omar Hassan", email: "omar@example.ae", phone: "+971 52 456 7890", role: "customer", verified: false, banned: true, kycStatus: "none", ads: 1, joined: "2026-02-18", lastActive: "2026-04-01", location: "Sharjah", notes: "Banned: fraudulent listings. Case #2026-0318.", permissions: BANNED_PERMS },
  { id: 5, name: "Layla Ibrahim", email: "layla@example.ae", phone: "+971 54 654 3210", role: "customer", verified: true, banned: false, kycStatus: "verified", ads: 6, joined: "2025-12-01", lastActive: "2026-07-14", location: "Dubai", notes: "", permissions: DEFAULT_CUSTOMER_PERMS },
  { id: 6, name: "Gulf Auto Trade", email: "ops@gulfauto.ae", phone: "+971 4 111 2233", role: "dealer", verified: false, banned: false, kycStatus: "pending", ads: 12, joined: "2026-03-22", lastActive: "2026-07-12", location: "Ajman", notes: "KYC docs submitted 2026-07-01. Awaiting legal review.", permissions: DEFAULT_DEALER_PERMS },
  { id: 7, name: "Fatima Al Zaabi", email: "fatima.z@example.ae", phone: "+971 56 789 0123", role: "customer", verified: true, banned: false, kycStatus: "verified", ads: 2, joined: "2026-05-14", lastActive: "2026-07-16", location: "Abu Dhabi", notes: "", permissions: DEFAULT_CUSTOMER_PERMS },
  { id: 8, name: "Tech Gadgets Store", email: "sales@techgadgets.ae", phone: "+971 4 555 7777", role: "dealer", verified: true, banned: false, kycStatus: "verified", ads: 44, joined: "2025-06-30", lastActive: "2026-07-15", location: "Dubai", notes: "Electronics specialist. Featured dealer.", permissions: { ...DEFAULT_DEALER_PERMS, maxAdsPerMonth: 200 } },
];

const seedReports: Report[] = [
  { id: 1, listingId: 9, reason: "Suspicious pricing", reporter: "Sara Khan", date: "2026-04-28", status: "open" },
  { id: 2, listingId: 3, reason: "Misleading title", reporter: "Layla Ibrahim", date: "2026-04-25", status: "open" },
  { id: 3, listingId: 7, reason: "Duplicate ad", reporter: "Omar Hassan", date: "2026-04-20", status: "resolved" },
  { id: 4, listingId: 12, reason: "Prohibited item", reporter: "Fatima Al Zaabi", date: "2026-05-10", status: "open" },
];

const DEFAULT_FRONTEND: GlobalFrontendSettings = {
  showHeroBanner: true, showFeaturedListings: true, showMotorsCategory: true,
  showClassifiedsCategory: true, showAuctionsModule: true, showMessagingFeature: true,
  showWishlistFeature: true, showPricingToGuests: true, allowGuestBrowsing: true,
  maintenanceMode: false, maintenanceBanner: "We are performing scheduled maintenance. Back shortly.",
  maxPhotosPerAd: 10, requirePhoneVerification: true, autoApproveDealerAds: true,
};

// ─── Sidebar Groups ───────────────────────────────────────────────────────────

type NavGroup = {
  label: string;
  items: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[];
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminPanel({ onBack, admin, onViewAuction }: Props) {
  const { auctions } = useAuction();
  const liveAuctions = auctions.filter((a) => getStatus(a) === "live").length;
  const [tab, setTab] = useState<Tab>("dashboard");
  const toAdmin = (list: Listing[]): AdminListing[] =>
    list.map((l, i) => {
      const nonAdmins = seedUsers.filter((s) => s.role !== "admin");
      const u = nonAdmins[i % nonAdmins.length] || seedUsers[i % seedUsers.length];
      return {
        ...l,
        seller: l.ownerName || u.name,
        sellerRole: (l.ownerId?.includes("dealer") ? "dealer" : u.role === "dealer" ? "dealer" : "customer") as "customer" | "dealer",
      };
    });

  const [listings, setListings] = useState<AdminListing[]>(() => toAdmin(listingsApi.getAllListingsSync()));

  useEffect(() => {
    const refresh = () => setListings(toAdmin(listingsApi.getAllListingsSync()));
    return listingsApi.subscribeListings(refresh);
  }, []);
  const [users, setUsers] = useState<AdminUser[]>(seedUsers);
  const [reports, setReports] = useState<Report[]>(seedReports);
  const [listingScope, setListingScope] = useState<"all" | "customer" | "dealer">("all");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ListingStatus>("all");
  const [frontendSettings, setFrontendSettings] = useState<GlobalFrontendSettings>(DEFAULT_FRONTEND);

  const stats = useMemo(() => ({
    total: listings.length,
    pending: listings.filter((l) => l.status === "pending").length,
    approved: listings.filter((l) => l.status === "approved").length,
    revenue: listings.reduce((s, l) => s + l.price, 0),
    verified: users.filter((u) => u.verified).length,
    banned: users.filter((u) => u.banned).length,
    openReports: reports.filter((r) => r.status === "open").length,
  }), [listings, users, reports]);

  const navGroups: NavGroup[] = [
    {
      label: "Core Operations",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "listings", label: "Listings", icon: FileText, badge: stats.pending },
        { id: "auction", label: "Auctions", icon: Gavel, badge: liveAuctions || undefined },
        { id: "reports", label: "Reports", icon: Flag, badge: stats.openReports },
      ],
    },
    {
      label: "People",
      items: [
        { id: "users", label: "Users", icon: Users },
        { id: "dealers", label: "Dealers", icon: Building2, badge: users.filter((u) => u.role === "dealer" && !u.verified).length || undefined },
      ],
    },
    {
      label: "Commerce",
      items: [
        { id: "financial", label: "Financial", icon: CreditCard },
      ],
    },
    {
      label: "Platform",
      items: [
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "frontend", label: "Frontend", icon: Monitor },
        { id: "elements", label: "Elements", icon: Wand2 },
        { id: "catalog", label: "Ad Catalog", icon: Tag },
      ],
    },
    {
      label: "System",
      items: [
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  const filteredListings = listings.filter(
    (l) =>
      (statusFilter === "all" || l.status === statusFilter) &&
      (listingScope === "all" || l.sellerRole === listingScope) &&
      (q === "" || l.title.toLowerCase().includes(q.toLowerCase()) || l.seller.toLowerCase().includes(q.toLowerCase()))
  );

  const setStatus = async (id: number, status: ListingStatus) => {
    const res = await listingsApi.updateListingStatus(id, status);
    if (res.ok) {
      setListings(toAdmin(listingsApi.getAllListingsSync()));
      toast.success(`Listing ${status}`);
    } else toast.error(res.error);
  };
  const removeListing = async (id: number) => {
    const res = await listingsApi.removeListing(id);
    if (res.ok) {
      setListings(toAdmin(listingsApi.getAllListingsSync()));
      toast.success("Listing deleted");
    } else toast.error(res.error);
  };
  const toggleVerify = (id: number) => {
    setUsers((us) => {
      const next = us.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u));
      const target = next.find((u) => u.id === id);
      if (target) void authApi.updateAccountFlags(target.email, { verified: target.verified });
      return next;
    });
    toast.success("Verification updated");
  };
  const toggleBan = (id: number) => {
    setUsers((us) => {
      const next = us.map((u) => {
        if (u.id !== id) return u;
        const nb = !u.banned;
        return {
          ...u,
          banned: nb,
          permissions: nb ? BANNED_PERMS : (u.role === "dealer" ? DEFAULT_DEALER_PERMS : DEFAULT_CUSTOMER_PERMS),
        };
      });
      const target = next.find((u) => u.id === id);
      if (target) {
        void authApi.updateAccountFlags(target.email, { banned: target.banned });
        void authApi.updateAccountPermissions(target.email, target.permissions);
      }
      return next;
    });
    toast.success("User status updated");
  };
  const updateUser = (updated: AdminUser) => {
    setUsers((us) => us.map((u) => (u.id === updated.id ? updated : u)));
    void authApi.updateAccountPermissions(updated.email, updated.permissions);
    void authApi.updateAccountFlags(updated.email, {
      banned: updated.banned,
      verified: updated.verified,
      name: updated.name,
    });
    toast.success("User updated — frontend permissions synced");
  };
  const resolveReport = (id: number) => { setReports((rs) => rs.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))); toast.success("Report resolved"); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="w-full px-4 h-14 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition">
            <ArrowLeft className="size-4" /> Back
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2.5">
            <span className="size-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-700 text-white flex items-center justify-center shadow">
              <ShieldCheck className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Panel</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Marketly · Operations Console</p>
            </div>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-slate-500">
              Signed in as <span className="text-slate-800 dark:text-slate-200 font-semibold">{admin.name}</span>
            </span>
            <span className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold">
              {admin.name.charAt(0)}
            </span>
            <HeaderControls />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-slate-900 dark:bg-[#0b0f1a] border-e border-slate-800 flex flex-col overflow-y-auto" style={{ minHeight: "calc(100vh - 56px)" }}>
          <div className="py-3 flex-1">
            {navGroups.map((group, gi) => (
              <div key={group.label} className={gi > 0 ? "mt-1 pt-2 border-t border-slate-800/60" : ""}>
                <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">{group.label}</p>
                {group.items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setTab(n.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition relative ${
                      tab === n.id
                        ? "text-blue-400 bg-blue-600/10"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    }`}
                  >
                    {tab === n.id && <div className="absolute inset-y-0 start-0 w-0.5 bg-blue-500 rounded-e" />}
                    <n.icon className={`size-4 shrink-0 ${tab === n.id ? "text-blue-400" : "text-slate-500"}`} />
                    <span className="flex-1 text-start">{n.label}</span>
                    {n.badge ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">{n.badge}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="px-4 py-3 border-t border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <div className="text-[11px]">
                <p className="text-slate-300 font-medium">All systems</p>
                <p className="text-emerald-400">Operational</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto p-5">
          {tab === "dashboard" && <Dashboard stats={stats} listings={listings} users={users} />}

          {tab === "listings" && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="px-4 pt-4 flex flex-wrap gap-2">
                <ScopeButton label="All" active={listingScope === "all"} onClick={() => setListingScope("all")} icon={Users} count={listings.length} />
                <ScopeButton label="Customers" active={listingScope === "customer"} onClick={() => setListingScope("customer")} icon={UserIcon} count={listings.filter((l) => l.sellerRole === "customer").length} />
                <ScopeButton label="Dealers" active={listingScope === "dealer"} onClick={() => setListingScope("dealer")} icon={Building2} count={listings.filter((l) => l.sellerRole === "dealer").length} />
              </div>
              <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-100 dark:border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or seller…"
                    className="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                  {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-md capitalize transition ${statusFilter === s ? "bg-white dark:bg-slate-950 shadow-sm font-medium" : "text-slate-500"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-start px-4 py-2.5">Listing</th>
                      <th className="text-start px-4 py-2.5">Seller</th>
                      <th className="text-start px-4 py-2.5">Price</th>
                      <th className="text-start px-4 py-2.5">Status</th>
                      <th className="text-end px-4 py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((l) => (
                      <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={l.img} alt="" className="size-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium truncate max-w-[200px]">{l.title}</p>
                              <p className="text-xs text-slate-500">{l.location} · {l.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><span>{l.seller}</span><RoleBadge role={l.sellerRole} /></div></td>
                        <td className="px-4 py-3 tabular-nums">AED {l.price.toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <IconBtn title="View" onClick={() => toast(`Opening ${l.title}`)}><Eye className="size-4" /></IconBtn>
                            {l.status !== "approved" && <IconBtn title="Approve" tone="success" onClick={() => setStatus(l.id, "approved")}><CheckCircle2 className="size-4" /></IconBtn>}
                            {l.status !== "rejected" && <IconBtn title="Reject" tone="warn" onClick={() => setStatus(l.id, "rejected")}><XCircle className="size-4" /></IconBtn>}
                            <IconBtn title="Delete" tone="danger" onClick={() => removeListing(l.id)}><Trash2 className="size-4" /></IconBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredListings.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-500">No listings match.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "users" && (
            <UsersSection
              users={users.filter((u) => u.role !== "dealer")}
              allUsers={users}
              scopeLabel="Customers & Admins"
              onUpdateUser={updateUser}
              onToggleVerify={toggleVerify}
              onToggleBan={toggleBan}
              listings={listings}
            />
          )}

          {tab === "dealers" && (
            <UsersSection
              users={users.filter((u) => u.role === "dealer")}
              scopeLabel="Dealers"
              variant="dealer"
              onUpdateUser={updateUser}
              onToggleVerify={toggleVerify}
              onToggleBan={toggleBan}
              listings={listings}
            />
          )}

          {tab === "reports" && <ReportsModule />}

          {tab === "financial" && <FinancialModule />}

          {tab === "catalog" && <CatalogEditor />}

          {tab === "analytics" && <Analytics listings={listings} users={users} reports={reports} />}

          {tab === "auction" && <AuctionAdmin admin={admin} onViewAuction={(id) => { if (onViewAuction) onViewAuction(id); }} />}

          {tab === "frontend" && <FrontendControlsPanel settings={frontendSettings} onChange={setFrontendSettings} />}

          {tab === "elements" && <ElementsEditor />}

          {tab === "settings" && (
            <div className="max-w-2xl space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-semibold mb-1">Platform Settings</h3>
                <p className="text-sm text-slate-500 mb-4">Core operational toggles for the marketplace.</p>
                {[
                  { label: "Auto-approve dealer listings", desc: "Skip manual review for verified dealers." },
                  { label: "Require phone verification", desc: "All new accounts must verify phone." },
                  { label: "Allow guest browsing", desc: "Visitors can browse without login." },
                  { label: "Maintenance mode", desc: "Temporarily disable new postings." },
                ].map((s, i) => <Toggle key={s.label} label={s.label} desc={s.desc} initial={i < 2} />)}
                <button onClick={() => toast.success("Settings saved")}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">Save changes</button>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="font-semibold mb-1">Notification Settings</h3>
                <p className="text-sm text-slate-500 mb-4">When to alert the operations team.</p>
                {[
                  { label: "New reports", desc: "Notify when a user files a report." },
                  { label: "New dealer signups", desc: "Alert when a dealer account is created." },
                  { label: "Pending listings digest", desc: "Daily digest of pending reviews." },
                  { label: "System health alerts", desc: "Critical uptime and latency notifications." },
                ].map((s, i) => <Toggle key={s.label} label={s.label} desc={s.desc} initial={i !== 2} />)}
                <button onClick={() => toast.success("Notification settings saved")}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">Save changes</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── Users Section ────────────────────────────────────────────────────────────

function UsersSection({ users, allUsers, scopeLabel, variant = "user", onUpdateUser, onToggleVerify, onToggleBan, listings }: {
  users: AdminUser[]; allUsers?: AdminUser[]; scopeLabel: string;
  variant?: "user" | "dealer";
  onUpdateUser: (u: AdminUser) => void; onToggleVerify: (id: number) => void;
  onToggleBan: (id: number) => void; listings: AdminListing[];
}) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [drawerTab, setDrawerTab] = useState<"profile" | "permissions" | "listings" | "notes">("profile");
  const [searchQ, setSearchQ] = useState("");
  const [kycFilter, setKycFilter] = useState<"all" | "verified" | "pending" | "none">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const source = allUsers || users;
  const filtered = users.filter((u) => {
    const matchSearch = !searchQ || u.name.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase());
    const matchKyc = kycFilter === "all" || u.kycStatus === kycFilter;
    return matchSearch && matchKyc;
  });

  const openDrawer = (u: AdminUser) => { setSelectedUser(u); setEditingUser({ ...u }); setDrawerTab("profile"); };
  const closeDrawer = () => { setSelectedUser(null); setEditingUser(null); };
  const saveEdits = () => { if (editingUser) { onUpdateUser(editingUser); setSelectedUser(editingUser); } };
  const updatePerm = (key: keyof UserPermissions, val: boolean | number) => {
    if (!editingUser) return;
    setEditingUser({ ...editingUser, permissions: { ...editingUser.permissions, [key]: val } });
  };
  const applyPreset = (preset: "customer" | "dealer" | "banned") => {
    if (!editingUser) return;
    const presets = { customer: DEFAULT_CUSTOMER_PERMS, dealer: DEFAULT_DEALER_PERMS, banned: BANNED_PERMS };
    setEditingUser({ ...editingUser, permissions: presets[preset] });
    toast(`Applied ${preset} preset`);
  };
  const userListings = selectedUser ? listings.filter((l) => l.seller === selectedUser.name) : [];

  return (
    <div className="flex gap-4 min-h-0">
      <div className="flex-1 min-w-0 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: users.length, color: "blue", icon: Users },
            { label: "Verified", value: users.filter((u) => u.verified).length, color: "emerald", icon: ShieldCheck },
            { label: "Banned", value: users.filter((u) => u.banned).length, color: "rose", icon: Ban },
            { label: "KYC Pending", value: users.filter((u) => u.kycStatus === "pending").length, color: "amber", icon: Clock },
          ].map((s) => {
            const bgMap: Record<string, string> = { blue: "bg-blue-50 dark:bg-blue-950/30", emerald: "bg-emerald-50 dark:bg-emerald-950/30", rose: "bg-rose-50 dark:bg-rose-950/30", amber: "bg-amber-50 dark:bg-amber-950/30" };
            const txtMap: Record<string, string> = { blue: "text-blue-600", emerald: "text-emerald-600", rose: "text-rose-600", amber: "text-amber-600" };
            return (
              <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3">
                <span className={`size-9 rounded-lg flex items-center justify-center ${bgMap[s.color]}`}>
                  <s.icon className={`size-4 ${txtMap[s.color]}`} />
                </span>
                <div>
                  <p className="text-xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search…"
                className="w-full ps-8 pe-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
            </div>
            <select value={kycFilter} onChange={(e) => setKycFilter(e.target.value as typeof kycFilter)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none">
              <option value="all">All KYC</option>
              <option value="verified">KYC Verified</option>
              <option value="pending">KYC Pending</option>
              <option value="none">No KYC</option>
            </select>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
              <UserPlus className="size-3.5" /> Add
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-start px-4 py-2.5">User</th>
                  <th className="text-start px-4 py-2.5">Role</th>
                  <th className="text-start px-4 py-2.5">KYC</th>
                  <th className="text-start px-4 py-2.5">Ads</th>
                  <th className="text-start px-4 py-2.5">Joined</th>
                  <th className="text-start px-4 py-2.5">Status</th>
                  <th className="text-end px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} onClick={() => openDrawer(u)}
                    className={`border-t border-slate-100 dark:border-slate-800 cursor-pointer transition ${selectedUser?.id === u.id ? "bg-blue-50 dark:bg-blue-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`size-9 rounded-full flex items-center justify-center text-sm font-bold ${u.banned ? "bg-rose-100 text-rose-700" : u.verified ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800"}`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-1">{u.name}{u.verified && <ShieldCheck className="size-3 text-blue-500" />}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3"><KycBadge status={u.kycStatus} /></td>
                    <td className="px-4 py-3 tabular-nums">{u.ads}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.joined}</td>
                    <td className="px-4 py-3">
                      {u.banned
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 font-medium">Banned</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">Active</span>}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Open" onClick={() => openDrawer(u)}><ChevronRight className="size-4" /></IconBtn>
                        <IconBtn title={u.verified ? "Unverify" : "Verify"} tone="success" onClick={() => onToggleVerify(u.id)}>
                          {u.verified ? <ShieldOff className="size-4" /> : <UserCheck className="size-4" />}
                        </IconBtn>
                        <IconBtn title={u.banned ? "Unban" : "Ban"} tone={u.banned ? "success" : "danger"} onClick={() => onToggleBan(u.id)}>
                          <Ban className="size-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-slate-500">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {selectedUser && editingUser && (
        <div className="w-80 shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden" style={{ maxHeight: "calc(100vh - 100px)" }}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-full flex items-center justify-center font-bold ${selectedUser.banned ? "bg-rose-100 text-rose-700" : "bg-gradient-to-br from-blue-500 to-violet-600 text-white"}`}>
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedUser.name}</p>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={closeDrawer}><X className="size-4 text-slate-400" /></button>
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
              {(["profile", "permissions", "listings", "notes"] as const).map((t) => (
                <button key={t} onClick={() => setDrawerTab(t)}
                  className={`flex-1 py-1.5 rounded-md capitalize transition ${drawerTab === t ? "bg-white dark:bg-slate-900 shadow-sm font-medium" : "text-slate-500"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {drawerTab === "profile" && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoRow icon={Mail} label="Email" value={selectedUser.email} />
                  <InfoRow icon={Phone} label="Phone" value={selectedUser.phone} />
                  <InfoRow icon={MapPin} label="Location" value={selectedUser.location} />
                  <InfoRow icon={Calendar} label="Joined" value={selectedUser.joined} />
                  <InfoRow icon={FileText} label="Ads" value={String(selectedUser.ads)} />
                  <InfoRow icon={Clock} label="Last active" value={selectedUser.lastActive} />
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                  {[
                    { label: "Name", key: "name" as const, type: "text" },
                    { label: "Email", key: "email" as const, type: "email" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs text-slate-500 block mb-1">{f.label}</label>
                      <input type={f.type} value={String(editingUser[f.key])}
                        onChange={(e) => setEditingUser({ ...editingUser, [f.key]: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">KYC Status</label>
                    <select value={editingUser.kycStatus} onChange={(e) => setEditingUser({ ...editingUser, kycStatus: e.target.value as AdminUser["kycStatus"] })}
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none">
                      <option value="none">No KYC</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>
                  <button onClick={saveEdits}
                    className="w-full py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium">Save Changes</button>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => { onToggleVerify(selectedUser.id); setSelectedUser((u) => u ? { ...u, verified: !u.verified } : u); }}
                    className="flex-1 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1">
                    {selectedUser.verified ? <><ShieldOff className="size-3" /> Unverify</> : <><ShieldCheck className="size-3" /> Verify</>}
                  </button>
                  <button onClick={() => { onToggleBan(selectedUser.id); setSelectedUser((u) => u ? { ...u, banned: !u.banned } : u); }}
                    className={`flex-1 py-1.5 text-xs rounded-lg border transition flex items-center justify-center gap-1 ${selectedUser.banned ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-rose-200 text-rose-600 hover:bg-rose-50"}`}>
                    <Ban className="size-3" />{selectedUser.banned ? "Unban" : "Ban"}
                  </button>
                </div>
              </div>
            )}

            {drawerTab === "permissions" && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Controls what this {variant === "dealer" ? "dealer" : "user"} can see and do on the frontend.
                </p>
                <div className="flex gap-1">
                  {(["customer", "dealer", "banned"] as const).map((p) => (
                    <button key={p} onClick={() => applyPreset(p)}
                      className="flex-1 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 capitalize transition">
                      {p === "banned" ? "Restrict" : `${p} preset`}
                    </button>
                  ))}
                </div>
                {[
                  { label: "Browse categories", keys: [
                    { key: "canBrowseMotors" as const, label: "Motors", icon: Car },
                    { key: "canBrowseClassifieds" as const, label: "Classifieds", icon: Tag },
                    { key: "canBrowseAuctions" as const, label: "Auctions", icon: Gavel },
                    { key: "canViewPricing" as const, label: "View Pricing", icon: DollarSign },
                  ]},
                  { label: "Actions", keys: [
                    { key: "canPostAds" as const, label: "Post Ads", icon: Plus },
                    { key: "canBidInAuctions" as const, label: "Bid in Auctions", icon: Gavel },
                    { key: "canPostAuction" as const, label: "Post Car in Auction", icon: Gavel },
                    { key: "canMessage" as const, label: "Messaging", icon: MessageCircle },
                    { key: "canSaveWishlist" as const, label: "Wishlist", icon: Heart },
                    { key: "canContactSellers" as const, label: "Contact Sellers", icon: Phone },
                  ]},
                  { label: "Dealer frontend tools", keys: [
                    { key: "canAccessDealerTools" as const, label: "Dealer tools", icon: Building2 },
                    { key: "canFeatureListings" as const, label: "Feature listings", icon: Sparkles },
                    { key: "canBulkManageAds" as const, label: "Bulk manage ads", icon: Layers },
                    { key: "showVerifiedBadge" as const, label: "Show verified badge", icon: ShieldCheck },
                  ]},
                ].map((section) => (
                  <div key={section.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{section.label}</p>
                    <div className="space-y-1">
                      {section.keys.map(({ key, label, icon: Icon }) => (
                        <PermToggle key={key} icon={Icon} label={label}
                          value={Boolean(editingUser.permissions[key])}
                          onChange={(v) => updatePerm(key, v)} />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm flex items-center gap-2"><FileText className="size-3.5 text-slate-500" /> Max ads/month</span>
                  <input type="number" min={0} max={9999} value={editingUser.permissions.maxAdsPerMonth}
                    onChange={(e) => updatePerm("maxAdsPerMonth", Number(e.target.value))}
                    className="w-16 px-2 py-1 text-sm text-end rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none" />
                </div>
                <button onClick={saveEdits}
                  className="w-full py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium">Save Permissions</button>
              </div>
            )}

            {drawerTab === "listings" && (
              <div className="p-4 space-y-2">
                {userListings.length === 0 ? <p className="text-sm text-slate-500 text-center py-8">No listings from this user.</p> :
                  userListings.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <img src={l.img} alt="" className="size-9 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{l.title}</p>
                        <p className="text-xs text-slate-500">AED {l.price.toLocaleString()}</p>
                      </div>
                      <StatusPill status={l.status} />
                    </div>
                  ))}
              </div>
            )}

            {drawerTab === "notes" && (
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-500">Internal admin notes — not visible to user.</p>
                <textarea value={editingUser.notes} onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  rows={6} placeholder="Add notes…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 resize-none" />
                <button onClick={saveEdits}
                  className="w-full py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium">Save Notes</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold">Add New User</h3><button onClick={() => setShowAddModal(false)}><X className="size-4 text-slate-400" /></button></div>
            <div className="space-y-3">
              {[{ label: "Full Name", placeholder: "Ahmed Al Mansoori" }, { label: "Email", placeholder: "user@example.ae" }, { label: "Phone", placeholder: "+971 50 000 0000" }].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Role</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none"><option>Customer</option><option>Dealer</option><option>Admin</option></select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { toast.success("User created"); setShowAddModal(false); }}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">Create</button>
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Frontend Controls ────────────────────────────────────────────────────────

function FrontendControlsPanel({ settings, onChange }: { settings: GlobalFrontendSettings; onChange: (s: GlobalFrontendSettings) => void }) {
  const update = (key: keyof GlobalFrontendSettings, val: boolean | string | number) => onChange({ ...settings, [key]: val });

  const sections = [
    { title: "Homepage Visibility", desc: "Control landing page sections.", icon: Monitor, controls: [
      { key: "showHeroBanner" as const, label: "Hero banner", desc: "Top promotional banner." },
      { key: "showFeaturedListings" as const, label: "Featured listings", desc: "Highlighted ads on homepage." },
    ]},
    { title: "Category Modules", desc: "Enable or disable entire categories.", icon: Layers, controls: [
      { key: "showMotorsCategory" as const, label: "Motors", desc: "Cars & vehicles section." },
      { key: "showClassifiedsCategory" as const, label: "Classifieds", desc: "Electronics, mobiles, computers." },
      { key: "showAuctionsModule" as const, label: "Auctions", desc: "Live online car auctions." },
    ]},
    { title: "Features", desc: "Toggle platform capabilities for all users.", icon: Sliders, controls: [
      { key: "showMessagingFeature" as const, label: "In-app messaging", desc: "Buyer-seller chat." },
      { key: "showWishlistFeature" as const, label: "Wishlist / Saved ads", desc: "Allow users to save listings." },
      { key: "showPricingToGuests" as const, label: "Pricing visible to guests", desc: "Show prices without login." },
      { key: "allowGuestBrowsing" as const, label: "Guest browsing", desc: "Browse without an account." },
    ]},
    { title: "Moderation", desc: "Platform-wide content policies.", icon: Shield, controls: [
      { key: "requirePhoneVerification" as const, label: "Require phone verification", desc: "New accounts must verify phone." },
      { key: "autoApproveDealerAds" as const, label: "Auto-approve dealer ads", desc: "Skip review for verified dealers." },
      { key: "maintenanceMode" as const, label: "Maintenance mode", desc: "Shows maintenance page, disables posting." },
    ]},
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {settings.maintenanceMode && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
          <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">Maintenance mode is ON</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">The frontend is showing the maintenance page to all visitors.</p>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3"><Bell className="size-4 text-blue-600" /><p className="font-semibold">Maintenance Banner</p></div>
        <textarea value={settings.maintenanceBanner} onChange={(e) => update("maintenanceBanner", e.target.value)} rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 resize-none" />
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><ImageIcon className="size-4 text-blue-600" /><div><p className="font-medium">Max photos per ad</p><p className="text-xs text-slate-500">Limit photos per listing.</p></div></div>
          <input type="number" min={1} max={30} value={settings.maxPhotosPerAd}
            onChange={(e) => update("maxPhotosPerAd", Number(e.target.value))}
            className="w-16 px-2 py-1.5 text-sm text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none" />
        </div>
      </div>
      {sections.map((sec) => (
        <div key={sec.title} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-1"><sec.icon className="size-4 text-blue-600" /><p className="font-semibold">{sec.title}</p></div>
          <p className="text-xs text-slate-500 mb-3">{sec.desc}</p>
          <div className="space-y-0.5">
            {sec.controls.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-slate-500">{desc}</p></div>
                <button onClick={() => update(key, !(settings[key] as boolean))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings[key] ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                  aria-pressed={settings[key] as boolean}>
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${settings[key] ? "start-5" : "start-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => toast.success("Frontend settings saved")}
        className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition font-medium">Save All Frontend Settings</button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

type StatsType = { total: number; pending: number; approved: number; revenue: number; verified: number; banned: number; openReports: number };

function Dashboard({ stats, listings, users }: { stats: StatsType; listings: AdminListing[]; users: AdminUser[] }) {
  const customerCount = users.filter((u) => u.role === "customer").length;
  const dealerCount = users.filter((u) => u.role === "dealer").length;
  const customerListings = listings.filter((l) => l.sellerRole === "customer").length;
  const dealerListings = listings.filter((l) => l.sellerRole === "dealer").length;
  const conversion = stats.total === 0 ? 0 : Math.round((stats.approved / stats.total) * 100);
  const traffic = [42, 51, 38, 65, 73, 58, 84, 92, 78, 95, 88, 110];
  const revenueTrend = [12, 18, 15, 22, 28, 25, 32, 38, 35, 42, 48, 55];
  const signups = [3, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15];
  const recent = [...listings].sort((a, b) => a.date - b.date).slice(0, 6);
  const topSellers = [...users].filter((u) => u.role !== "admin").sort((a, b) => b.ads - a.ads).slice(0, 5);
  const activity = [
    { icon: CheckCircle2, tone: "emerald", text: "Listing #11 approved by system", time: "2m ago" },
    { icon: ShieldCheck, tone: "blue", text: "Dealer 'Premium Motors LLC' verified", time: "14m ago" },
    { icon: Flag, tone: "amber", text: "New report on listing #9", time: "32m ago" },
    { icon: Ban, tone: "rose", text: "User 'Omar Hassan' banned", time: "1h ago" },
    { icon: Sparkles, tone: "violet", text: "5 new listings auto-approved", time: "2h ago" },
    { icon: UserCheck, tone: "emerald", text: "12 new customer signups today", time: "3h ago" },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative overflow-hidden border border-slate-800">
        <div className="absolute -top-12 -end-12 size-48 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-16 start-1/3 size-56 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Zap className="size-6" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-[10px] uppercase tracking-widest text-blue-300/80">Core & Orchestra</p>
            <p className="text-2xl font-bold tracking-tight">Live Operations Console</p>
            <p className="text-white/60 text-sm">Real-time platform health · all systems nominal</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <KpiMini label="Conversion" value={`${conversion}%`} delta="+4.2%" up />
            <KpiMini label="Latency" value="84ms" delta="-12ms" up />
            <KpiMini label="Uptime" value="99.99%" delta="30d" up />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NinjaKpi label="Total Listings" value={stats.total} icon={FileText} tone="blue" trend={traffic} delta="+18%" up />
        <NinjaKpi label="Pending Review" value={stats.pending} icon={AlertTriangle} tone="amber" trend={[5,7,6,8,9,7,10,8,11,9,12,10]} delta="-3" up />
        <NinjaKpi label="Inventory Value" value={`AED ${(stats.revenue / 1_000_000).toFixed(1)}M`} icon={DollarSign} tone="violet" trend={revenueTrend} delta="+24%" up />
        <NinjaKpi label="Active Users" value={users.length} icon={Users} tone="emerald" trend={signups} delta="+12" up />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Activity className="size-4 text-blue-600" /><p className="font-semibold">Traffic & Revenue (last 12 weeks)</p></div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" /> Traffic</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-violet-500" /> Revenue</span>
            </div>
          </div>
          <DualLineChart a={traffic} b={revenueTrend} />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4"><Users className="size-4 text-blue-600" /><p className="font-semibold">User mix</p></div>
          <Donut customers={customerCount} dealers={dealerCount} />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-blue-500" /> Customers</span>
              <span><b>{customerCount}</b> · {customerListings} ads</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-violet-500" /> Dealers</span>
              <span><b>{dealerCount}</b> · {dealerListings} ads</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2"><TrendingUp className="size-4 text-blue-600" /><p className="font-semibold">Live listings feed</p></div>
            <span className="flex items-center gap-1 text-xs text-emerald-600"><span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> live</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((l) => (
              <div key={l.id} className="px-4 py-3 flex items-center gap-3">
                <img src={l.img} alt="" className="size-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{l.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">{l.seller} <RoleBadge role={l.sellerRole} /> · {l.location}</p>
                </div>
                <span className="text-sm tabular-nums">AED {l.price.toLocaleString()}</span>
                <StatusPill status={l.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"><Clock className="size-4 text-blue-600" /><p className="font-semibold">Activity feed</p></div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activity.map((a, i) => {
              const tones: Record<string, string> = { emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40", blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/40", amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/40", rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/40", violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/40" };
              return (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <span className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${tones[a.tone]}`}><a.icon className="size-4" /></span>
                  <div className="flex-1 min-w-0"><p className="text-sm">{a.text}</p><p className="text-xs text-slate-500">{a.time}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4"><p className="font-semibold flex items-center gap-2"><Sparkles className="size-4 text-blue-600" /> Top sellers</p><span className="text-xs text-slate-500">by ads posted</span></div>
          <div className="space-y-3">
            {topSellers.map((u, i) => {
              const max = Math.max(1, ...topSellers.map((s) => s.ads));
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="size-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs">#{i + 1}</span>
                  <span className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate flex items-center gap-1 text-sm font-medium">{u.name} <RoleBadge role={u.role === "dealer" ? "dealer" : "customer"} /></p>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1"><div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${(u.ads / max) * 100}%` }} /></div>
                  </div>
                  <span className="text-sm tabular-nums font-semibold">{u.ads}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4"><Globe2 className="size-4 text-blue-600" /><p className="font-semibold">Health monitors</p></div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "API", value: 99.9, tone: "emerald" }, { label: "Search", value: 98.7, tone: "emerald" },
              { label: "Chat", value: 97.2, tone: "amber" }, { label: "Payments", value: 99.4, tone: "emerald" },
              { label: "CDN", value: 99.8, tone: "emerald" }, { label: "Webhooks", value: 95.1, tone: "amber" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{m.label}</span>
                  <span className={m.tone === "emerald" ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>{m.value}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div className={`h-full ${m.tone === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────

function Analytics({ listings, users, reports }: { listings: AdminListing[]; users: AdminUser[]; reports: Report[] }) {
  const { banners, media, history, registry, values } = useElements();
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const seed = useMemo(() => listings.length + users.length + reports.length + days, [listings.length, users.length, reports.length, days]);
  const rnd = (n: number, base: number, jitter: number) => { let x = Math.sin(seed * 9301 + n * 49297) * 233280; x = x - Math.floor(x); return Math.round(base + (x - 0.5) * jitter * 2); };
  const views = useMemo(() => Array.from({ length: days }, (_, i) => Math.max(50, rnd(i, 800 + i * 12, 250))), [days, seed]);
  const leads = useMemo(() => views.map((v, i) => Math.max(5, Math.round(v * (0.04 + (rnd(i + 100, 10, 6) / 1000))))), [views]);
  const totalViews = views.reduce((a, b) => a + b, 0);
  const totalLeads = leads.reduce((a, b) => a + b, 0);
  const conv = ((totalLeads / Math.max(1, totalViews)) * 100).toFixed(2);
  const half = Math.floor(views.length / 2);
  const viewsTrend = ((views.slice(half).reduce((a, b) => a + b, 0) - views.slice(0, half).reduce((a, b) => a + b, 0)) / Math.max(1, views.slice(0, half).reduce((a, b) => a + b, 0)) * 100);
  const leadsTrend = ((leads.slice(half).reduce((a, b) => a + b, 0) - leads.slice(0, half).reduce((a, b) => a + b, 0)) / Math.max(1, leads.slice(0, half).reduce((a, b) => a + b, 0)) * 100);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-6 relative overflow-hidden">
        <div className="relative flex items-center gap-4 flex-wrap">
          <span className="size-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center"><BarChart3 className="size-6" /></span>
          <div className="flex-1 min-w-[200px]">
            <p className="text-2xl font-bold tracking-tight">Ninja Analytics</p>
            <p className="text-sm text-white/70">Live signals · {listings.length} listings · {users.length} users</p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-white/10 backdrop-blur border border-white/20">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-sm transition ${range === r ? "bg-white text-slate-900 font-medium" : "text-white/80 hover:bg-white/10"}`}>{r}</button>
            ))}
          </div>
        </div>
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Page views", value: totalViews.toLocaleString(), trend: viewsTrend, icon: Eye, tint: "from-blue-400 to-blue-600" },
            { label: "Leads", value: totalLeads.toLocaleString(), trend: leadsTrend, icon: MousePointerClick, tint: "from-violet-400 to-violet-600" },
            { label: "Conversion", value: `${conv}%`, trend: leadsTrend - viewsTrend, icon: Zap, tint: "from-emerald-400 to-emerald-600" },
            { label: "Listings", value: listings.length.toString(), trend: 12, icon: FileText, tint: "from-amber-400 to-amber-600" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`size-8 rounded-md bg-gradient-to-br ${k.tint} flex items-center justify-center`}><k.icon className="size-4 text-white" /></span>
                <span className={`text-xs font-medium ${k.trend >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{k.trend >= 0 ? "↑" : "↓"} {Math.abs(k.trend).toFixed(1)}%</span>
              </div>
              <p className="text-xs text-white/70">{k.label}</p>
              <p className="text-2xl font-bold tabular-nums">{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="font-semibold mb-4 flex items-center gap-2"><Activity className="size-4 text-blue-600" /> Traffic & leads over {days} days</p>
        <DualAreaChart series1={views} series2={leads} color1="#3b82f6" color2="#a855f7" />
      </div>
    </div>
  );
}

// ─── Shared Chart Components ──────────────────────────────────────────────────

function NinjaKpi({ label, value, icon: Icon, tone, trend, delta, up }: { label: string; value: number | string; icon: typeof FileText; tone: string; trend: number[]; delta: string; up: boolean }) {
  const tones: Record<string, string> = { blue: "from-blue-500 to-blue-600", amber: "from-amber-500 to-orange-600", emerald: "from-emerald-500 to-green-600", violet: "from-violet-500 to-purple-600" };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{label}</p>
        <span className={`size-8 rounded-lg bg-gradient-to-br ${tones[tone]} text-white flex items-center justify-center`}><Icon className="size-4" /></span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs flex items-center gap-0.5 font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{delta}
        </span>
        <Sparkline data={trend} tone={tone} />
      </div>
    </div>
  );
}

function Sparkline({ data, tone }: { data: number[]; tone: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 24;
  const pts = data.map((v, i) => { const x = (i / (data.length - 1)) * w; const y = h - ((v - min) / Math.max(1, max - min)) * h; return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ");
  const stroke: Record<string, string> = { blue: "#3b82f6", amber: "#f59e0b", emerald: "#10b981", violet: "#8b5cf6" };
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline fill="none" stroke={stroke[tone]} strokeWidth={1.5} points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DualLineChart({ a, b }: { a: number[]; b: number[] }) {
  const w = 600, h = 180, pad = 8;
  const all = [...a, ...b], max = Math.max(...all), min = Math.min(...all);
  const toPts = (data: number[]) => data.map((v, i) => { const x = pad + (i / (data.length - 1)) * (w - pad * 2); const y = h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ");
  const area = (data: number[]) => { const pts = toPts(data).split(" "); return `${pts[0].split(",")[0]},${h - pad} ${pts.join(" ")} ${pts[pts.length - 1].split(",")[0]},${h - pad}`; };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      <defs>
        <linearGradient id="gA" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
        <linearGradient id="gB" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (<line key={i} x1={pad} x2={w - pad} y1={pad + i * ((h - pad * 2) / 3)} y2={pad + i * ((h - pad * 2) / 3)} stroke="currentColor" strokeOpacity="0.08" />))}
      <polygon points={area(a)} fill="url(#gA)" />
      <polygon points={area(b)} fill="url(#gB)" />
      <polyline points={toPts(a)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={toPts(b)} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DualAreaChart({ series1, series2, color1, color2 }: { series1: number[]; series2: number[]; color1: string; color2: string }) {
  const w = 800, h = 200, pad = 24;
  const all = [...series1, ...series2], min = Math.min(...all), max = Math.max(...all), range = max - min || 1;
  const toPts = (s: number[]) => s.map((v, i) => `${pad + (i / (s.length - 1)) * (w - pad * 2)},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(" ");
  const pts1 = toPts(series1), pts2 = toPts(series2);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-52">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color1} stopOpacity={0.3} /><stop offset="100%" stopColor={color1} stopOpacity={0} /></linearGradient>
        <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color2} stopOpacity={0.3} /><stop offset="100%" stopColor={color2} stopOpacity={0} /></linearGradient>
      </defs>
      <polygon points={`${pad},${h - pad} ${pts1} ${w - pad},${h - pad}`} fill="url(#g1)" />
      <polygon points={`${pad},${h - pad} ${pts2} ${w - pad},${h - pad}`} fill="url(#g2)" />
      <polyline points={pts1} fill="none" stroke={color1} strokeWidth={2} />
      <polyline points={pts2} fill="none" stroke={color2} strokeWidth={2} />
    </svg>
  );
}

function Donut({ customers, dealers }: { customers: number; dealers: number }) {
  const total = Math.max(1, customers + dealers), pctA = customers / total, r = 50, c = 2 * Math.PI * r;
  return (
    <div className="flex justify-center">
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth={16} />
        <circle cx={70} cy={70} r={r} fill="none" stroke="#3b82f6" strokeWidth={16} strokeDasharray={`${c * pctA} ${c}`} transform="rotate(-90 70 70)" strokeLinecap="round" />
        <circle cx={70} cy={70} r={r} fill="none" stroke="#8b5cf6" strokeWidth={16} strokeDasharray={`${c * (1 - pctA)} ${c}`} strokeDashoffset={-c * pctA} transform="rotate(-90 70 70)" strokeLinecap="round" />
        <text x="70" y="68" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100" style={{ fontSize: 18, fontWeight: 700 }}>{total}</text>
        <text x="70" y="86" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10 }}>users</text>
      </svg>
    </div>
  );
}

function KpiMini({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 border border-white/10">
      <p className="text-[10px] uppercase tracking-wider text-white/50">{label}</p>
      <p className="text-lg font-bold tracking-tight">{value}</p>
      <p className={`text-[10px] flex items-center gap-0.5 font-medium ${up ? "text-emerald-300" : "text-rose-300"}`}>
        {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />} {delta}
      </p>
    </div>
  );
}

// ─── Small shared components ──────────────────────────────────────────────────

function ScopeButton({ label, active, onClick, icon: Icon, count }: { label: string; active: boolean; onClick: () => void; icon: typeof Users; count: number }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition ${active ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"}`}>
      <Icon className="size-3.5" /><span>{label}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${active ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>{count}</span>
    </button>
  );
}

function RoleBadge({ role }: { role: "customer" | "dealer" | "admin" }) {
  if (role === "admin") {
    return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium"><ShieldCheck className="size-3" /> Admin</span>;
  }
  return role === "dealer"
    ? <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-medium"><Building2 className="size-3" /> Dealer</span>
    : <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-medium"><UserIcon className="size-3" /> Customer</span>;
}

function KycBadge({ status }: { status: "none" | "pending" | "verified" }) {
  if (status === "verified") return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium"><ShieldCheck className="size-3" /> KYC</span>;
  if (status === "pending") return <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-medium"><Clock className="size-3" /> Pending</span>;
  return null;
}

function PermToggle({ icon: Icon, label, value, onChange }: { icon: any; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg border transition ${value ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"}`}>
      <div className="flex items-center gap-2 text-sm"><Icon className={`size-3.5 ${value ? "text-blue-600" : "text-slate-400"}`} /><span className={value ? "" : "text-slate-500"}>{label}</span></div>
      <button onClick={() => onChange(!value)} className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${value ? "start-4" : "start-0.5"}`} />
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wide"><Icon className="size-3" /> {label}</div>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}

function Toggle({ label, desc, initial }: { label: string; desc: string; initial?: boolean }) {
  const [on, setOn] = useState(!!initial);
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-slate-500">{desc}</p></div>
      <button onClick={() => setOn(!on)} className={`relative w-11 h-6 rounded-full transition ${on ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`} aria-pressed={on}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${on ? "start-5" : "start-0.5"}`} />
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: ListingStatus }) {
  const map: Record<ListingStatus, string> = { pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400", approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", rejected: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" };
  return <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${map[status]}`}>{status}</span>;
}

function IconBtn({ children, onClick, title, tone = "default" }: { children: React.ReactNode; onClick: () => void; title: string; tone?: "default" | "success" | "warn" | "danger" }) {
  const tones: Record<string, string> = { default: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800", success: "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40", warn: "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40", danger: "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40" };
  return <button title={title} onClick={onClick} className={`size-8 rounded-md flex items-center justify-center transition ${tones[tone]}`}>{children}</button>;
}
