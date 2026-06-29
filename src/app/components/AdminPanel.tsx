import { useMemo, useState } from "react";
import {
  ArrowLeft, LayoutDashboard, FileText, Users, Flag, BarChart3, Settings,
  Search, CheckCircle2, XCircle, Trash2, Eye, ShieldCheck, ShieldOff,
  TrendingUp, DollarSign, Tag, AlertTriangle, Ban, UserCheck,
  Activity, Zap, Globe2, Building2, User as UserIcon, Sparkles, Clock, ArrowUpRight, ArrowDownRight,
  Wand2, Car, Home, Smartphone, MapPin, MessageCircle, Image as ImageIcon, Heart, MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";
import { HeaderControls } from "./HeaderControls";
import { LISTINGS, Listing } from "../data";
import { ElementsEditor } from "./ElementsEditor";
import { useElements } from "../ElementsContext";

type Props = { onBack: () => void; admin: { name: string } };
type Tab = "dashboard" | "listings" | "users" | "reports" | "analytics" | "elements" | "settings";
type ListingStatus = "pending" | "approved" | "rejected";
type AdminListing = Listing & { status: ListingStatus; seller: string; sellerRole: "customer" | "dealer" };

type AdminUser = {
  id: number; name: string; email: string;
  role: "customer" | "dealer" | "admin";
  verified: boolean; banned: boolean; ads: number; joined: string;
};

type Report = {
  id: number; listingId: number; reason: string;
  reporter: string; date: string; status: "open" | "resolved";
};

const seedUsers: AdminUser[] = [
  { id: 1, name: "Ahmed Al Mansoori", email: "ahmed@example.ae", role: "dealer", verified: true, banned: false, ads: 24, joined: "2025-08-12" },
  { id: 2, name: "Sara Khan", email: "sara.k@example.com", role: "customer", verified: false, banned: false, ads: 3, joined: "2026-01-04" },
  { id: 3, name: "Premium Motors LLC", email: "sales@premiummotors.ae", role: "dealer", verified: true, banned: false, ads: 87, joined: "2024-11-20" },
  { id: 4, name: "Omar Hassan", email: "omar@example.ae", role: "customer", verified: false, banned: true, ads: 1, joined: "2026-02-18" },
  { id: 5, name: "Layla Ibrahim", email: "layla@example.ae", role: "customer", verified: true, banned: false, ads: 6, joined: "2025-12-01" },
  { id: 6, name: "Gulf Auto Trade", email: "ops@gulfauto.ae", role: "dealer", verified: false, banned: false, ads: 12, joined: "2026-03-22" },
];

const seedReports: Report[] = [
  { id: 1, listingId: 9, reason: "Suspicious pricing", reporter: "Sara Khan", date: "2026-04-28", status: "open" },
  { id: 2, listingId: 3, reason: "Misleading title", reporter: "Layla Ibrahim", date: "2026-04-25", status: "open" },
  { id: 3, listingId: 7, reason: "Duplicate ad", reporter: "Omar Hassan", date: "2026-04-20", status: "resolved" },
];

export function AdminPanel({ onBack, admin }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [listings, setListings] = useState<AdminListing[]>(() =>
    LISTINGS.map((l, i) => {
      const nonAdmins = seedUsers.filter((s) => s.role !== "admin");
      const u = nonAdmins[i % nonAdmins.length] || seedUsers[i % seedUsers.length];
      return {
        ...l,
        status: i % 4 === 0 ? "pending" : i % 7 === 0 ? "rejected" : "approved",
        seller: u.name,
        sellerRole: u.role === "dealer" ? "dealer" : "customer",
      };
    })
  );
  const [userScope, setUserScope] = useState<"all" | "customer" | "dealer">("all");
  const [listingScope, setListingScope] = useState<"all" | "customer" | "dealer">("all");
  const [users, setUsers] = useState<AdminUser[]>(seedUsers);
  const [reports, setReports] = useState<Report[]>(seedReports);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ListingStatus>("all");

  const stats = useMemo(() => {
    const total = listings.length;
    const pending = listings.filter((l) => l.status === "pending").length;
    const approved = listings.filter((l) => l.status === "approved").length;
    const revenue = listings.reduce((s, l) => s + l.price, 0);
    const verified = users.filter((u) => u.verified).length;
    const banned = users.filter((u) => u.banned).length;
    const openReports = reports.filter((r) => r.status === "open").length;
    return { total, pending, approved, revenue, verified, banned, openReports };
  }, [listings, users, reports]);

  const filteredListings = listings.filter(
    (l) =>
      (statusFilter === "all" || l.status === statusFilter) &&
      (listingScope === "all" || l.sellerRole === listingScope) &&
      (q === "" ||
        l.title.toLowerCase().includes(q.toLowerCase()) ||
        l.seller.toLowerCase().includes(q.toLowerCase()))
  );
  const filteredUsers = users.filter(
    (u) => userScope === "all" || u.role === userScope
  );

  const setStatus = (id: number, status: ListingStatus) => {
    setListings((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success(`Listing ${status}`);
  };
  const removeListing = (id: number) => {
    setListings((ls) => ls.filter((l) => l.id !== id));
    toast.success("Listing deleted");
  };
  const toggleVerify = (id: number) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u)));
    toast.success("User verification updated");
  };
  const toggleBan = (id: number) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, banned: !u.banned } : u)));
    toast.success("User status updated");
  };
  const resolveReport = (id: number) => {
    setReports((rs) => rs.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
    toast.success("Report resolved");
  };

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "listings", label: "Listings", icon: FileText, badge: stats.pending },
    { id: "users", label: "Users", icon: Users },
    { id: "reports", label: "Reports", icon: Flag, badge: stats.openReports },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "elements", label: "Elements", icon: Wand2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="w-full px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300">
            <ArrowLeft className="size-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="size-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="tracking-tight">Admin Panel</p>
              <p className="text-xs text-slate-500">Marketly · Operations Console</p>
            </div>
          </div>
          <div className="ms-auto flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-slate-500">Signed in as <span className="text-slate-900 dark:text-slate-100">{admin.name}</span></span>
            <HeaderControls />
          </div>
        </div>
      </header>

      <div className="w-full px-6 py-6 grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-1">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-start transition ${
                tab === n.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <n.icon className="size-4" />
              <span className="flex-1">{n.label}</span>
              {n.badge ? (
                <span className={`text-xs px-1.5 py-0.5 rounded ${tab === n.id ? "bg-white/20" : "bg-blue-600 text-white"}`}>
                  {n.badge}
                </span>
              ) : null}
            </button>
          ))}
        </aside>

        <main className="space-y-6">
          {tab === "dashboard" && (
            <Dashboard stats={stats} listings={listings} users={users} />
          )}

          {tab === "listings" && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="px-4 pt-4 flex flex-wrap gap-2">
                <ScopeButton label="All" active={listingScope === "all"} onClick={() => setListingScope("all")} icon={Users} count={listings.length} />
                <ScopeButton label="Customers" active={listingScope === "customer"} onClick={() => setListingScope("customer")} icon={UserIcon} count={listings.filter((l) => l.sellerRole === "customer").length} />
                <ScopeButton label="Dealers" active={listingScope === "dealer"} onClick={() => setListingScope("dealer")} icon={Building2} count={listings.filter((l) => l.sellerRole === "dealer").length} />
              </div>
              <div className="p-4 flex flex-wrap gap-3 items-center border-b border-slate-100 dark:border-slate-800">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="Search title or seller…"
                    className="w-full ps-10 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-md capitalize ${statusFilter === s ? "bg-white dark:bg-slate-950 shadow-sm" : "text-slate-500"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                    <tr>
                      <th className="text-start px-4 py-2">Listing</th>
                      <th className="text-start px-4 py-2">Seller</th>
                      <th className="text-start px-4 py-2">Price</th>
                      <th className="text-start px-4 py-2">Status</th>
                      <th className="text-end px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((l) => (
                      <tr key={l.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={l.img} alt="" className="size-10 rounded object-cover" />
                            <div>
                              <p className="text-slate-900 dark:text-slate-100">{l.title}</p>
                              <p className="text-xs text-slate-500">{l.location} · {l.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{l.seller}</span>
                            <RoleBadge role={l.sellerRole} />
                          </div>
                        </td>
                        <td className="px-4 py-3">AED {l.price.toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <IconBtn title="View" onClick={() => toast(`Opening ${l.title}`)}><Eye className="size-4" /></IconBtn>
                            {l.status !== "approved" && (
                              <IconBtn title="Approve" tone="success" onClick={() => setStatus(l.id, "approved")}>
                                <CheckCircle2 className="size-4" />
                              </IconBtn>
                            )}
                            {l.status !== "rejected" && (
                              <IconBtn title="Reject" tone="warn" onClick={() => setStatus(l.id, "rejected")}>
                                <XCircle className="size-4" />
                              </IconBtn>
                            )}
                            <IconBtn title="Delete" tone="danger" onClick={() => removeListing(l.id)}>
                              <Trash2 className="size-4" />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredListings.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-slate-500">No listings match.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "users" && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="px-4 pt-4 pb-2 flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800">
                <ScopeButton label="All Users" active={userScope === "all"} onClick={() => setUserScope("all")} icon={Users} count={users.length} />
                <ScopeButton label="Customers" active={userScope === "customer"} onClick={() => setUserScope("customer")} icon={UserIcon} count={users.filter((u) => u.role === "customer").length} />
                <ScopeButton label="Dealers" active={userScope === "dealer"} onClick={() => setUserScope("dealer")} icon={Building2} count={users.filter((u) => u.role === "dealer").length} />
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                  <tr>
                    <th className="text-start px-4 py-3">User</th>
                    <th className="text-start px-4 py-3">Role</th>
                    <th className="text-start px-4 py-3">Ads</th>
                    <th className="text-start px-4 py-3">Joined</th>
                    <th className="text-start px-4 py-3">Status</th>
                    <th className="text-end px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="size-9 rounded-full bg-slate-900 text-white flex items-center justify-center">
                            {u.name.charAt(0)}
                          </span>
                          <div>
                            <p className="text-slate-900 dark:text-slate-100 flex items-center gap-1">
                              {u.name}
                              {u.verified && <ShieldCheck className="size-3.5 text-blue-600" />}
                            </p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{u.role}</td>
                      <td className="px-4 py-3">{u.ads}</td>
                      <td className="px-4 py-3">{u.joined}</td>
                      <td className="px-4 py-3">
                        {u.banned ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">Banned</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <IconBtn title={u.verified ? "Unverify" : "Verify"} tone="success" onClick={() => toggleVerify(u.id)}>
                            {u.verified ? <ShieldOff className="size-4" /> : <UserCheck className="size-4" />}
                          </IconBtn>
                          <IconBtn title={u.banned ? "Unban" : "Ban"} tone={u.banned ? "success" : "danger"} onClick={() => toggleBan(u.id)}>
                            <Ban className="size-4" />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </section>
          )}

          {tab === "reports" && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                  <tr>
                    <th className="text-start px-4 py-3">Listing</th>
                    <th className="text-start px-4 py-3">Reason</th>
                    <th className="text-start px-4 py-3">Reporter</th>
                    <th className="text-start px-4 py-3">Date</th>
                    <th className="text-start px-4 py-3">Status</th>
                    <th className="text-end px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const l = listings.find((x) => x.id === r.listingId);
                    return (
                      <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-3">{l ? l.title : `#${r.listingId}`}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="size-4" /> {r.reason}
                          </span>
                        </td>
                        <td className="px-4 py-3">{r.reporter}</td>
                        <td className="px-4 py-3">{r.date}</td>
                        <td className="px-4 py-3 capitalize">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            r.status === "open"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            {r.status === "open" && (
                              <IconBtn title="Resolve" tone="success" onClick={() => resolveReport(r.id)}>
                                <CheckCircle2 className="size-4" />
                              </IconBtn>
                            )}
                            {l && (
                              <IconBtn title="Remove listing" tone="danger" onClick={() => { removeListing(l.id); resolveReport(r.id); }}>
                                <Trash2 className="size-4" />
                              </IconBtn>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          {tab === "analytics" && <Analytics listings={listings} users={users} reports={reports} />}

          {tab === "elements" && <ElementsEditor />}

          {tab === "settings" && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-w-2xl">
              <h3 className="tracking-tight">Platform settings</h3>
              {[
                { label: "Auto-approve dealer listings", desc: "Skip manual review for verified dealers." },
                { label: "Allow guest browsing", desc: "Visitors can browse without login." },
                { label: "Maintenance mode", desc: "Temporarily disable new postings." },
              ].map((s, i) => (
                <Toggle key={s.label} label={s.label} desc={s.desc} initial={i < 1} />
              ))}
              <button onClick={() => toast.success("Settings saved")} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Save changes
              </button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

type StatsType = {
  total: number; pending: number; approved: number; revenue: number;
  verified: number; banned: number; openReports: number;
};

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
  const topSellers = [...users]
    .filter((u) => u.role !== "admin")
    .sort((a, b) => b.ads - a.ads).slice(0, 5);

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
          <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Zap className="size-6" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs uppercase tracking-widest text-blue-300/80">Ninja Dashboard</p>
            <p className="tracking-tight" style={{ fontSize: "1.5rem" }}>Live Operations Console</p>
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
        <NinjaKpi label="Pending Review" value={stats.pending} icon={AlertTriangle} tone="amber" trend={[5, 7, 6, 8, 9, 7, 10, 8, 11, 9, 12, 10]} delta="-3" up />
        <NinjaKpi label="Inventory Value" value={`AED ${(stats.revenue / 1_000_000).toFixed(1)}M`} icon={DollarSign} tone="violet" trend={revenueTrend} delta="+24%" up />
        <NinjaKpi label="Active Users" value={users.length} icon={Users} tone="emerald" trend={signups} delta="+12" up />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-blue-600" />
              <p className="tracking-tight">Traffic & Revenue (last 12 weeks)</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" /> Traffic</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-violet-500" /> Revenue</span>
            </div>
          </div>
          <DualLineChart a={traffic} b={revenueTrend} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-4 text-blue-600" />
            <p className="tracking-tight">User mix</p>
          </div>
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
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-blue-600" />
              <p className="tracking-tight">Live listings feed</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> live
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((l) => (
              <div key={l.id} className="px-4 py-3 flex items-center gap-3">
                <img src={l.img} alt="" className="size-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-slate-900 dark:text-slate-100">{l.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    {l.seller} <RoleBadge role={l.sellerRole} /> · {l.location}
                  </p>
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">AED {l.price.toLocaleString()}</span>
                <StatusPill status={l.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Clock className="size-4 text-blue-600" />
            <p className="tracking-tight">Activity feed</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activity.map((a, i) => {
              const tones: Record<string, string> = {
                emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40",
                blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/40",
                amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/40",
                rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/40",
                violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/40",
              };
              return (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <span className={`size-8 rounded-lg flex items-center justify-center ${tones[a.tone]}`}>
                    <a.icon className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{a.text}</p>
                    <p className="text-xs text-slate-500">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="tracking-tight flex items-center gap-2"><Sparkles className="size-4 text-blue-600" /> Top sellers</p>
            <span className="text-xs text-slate-500">by ads posted</span>
          </div>
          <div className="space-y-3">
            {topSellers.map((u, i) => {
              const max = Math.max(1, ...topSellers.map((s) => s.ads));
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="size-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs">
                    #{i + 1}
                  </span>
                  <span className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                    {u.name.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate flex items-center gap-1 text-sm">{u.name} <RoleBadge role={u.role === "dealer" ? "dealer" : "customer"} /></p>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${(u.ads / max) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm tabular-nums">{u.ads}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="size-4 text-blue-600" />
            <p className="tracking-tight">Health monitors</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "API", value: 99.9, tone: "emerald" },
              { label: "Search", value: 98.7, tone: "emerald" },
              { label: "Chat", value: 97.2, tone: "amber" },
              { label: "Payments", value: 99.4, tone: "emerald" },
              { label: "CDN", value: 99.8, tone: "emerald" },
              { label: "Webhooks", value: 95.1, tone: "amber" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{m.label}</span>
                  <span className={m.tone === "emerald" ? "text-emerald-600" : "text-amber-600"}>{m.value}%</span>
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

function NinjaKpi({ label, value, icon: Icon, tone, trend, delta, up }: {
  label: string; value: number | string; icon: typeof FileText; tone: string;
  trend: number[]; delta: string; up: boolean;
}) {
  const tones: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-orange-600",
    emerald: "from-emerald-500 to-green-600",
    violet: "from-violet-500 to-purple-600",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{label}</p>
        <span className={`size-8 rounded-lg bg-gradient-to-br ${tones[tone]} text-white flex items-center justify-center`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 tracking-tight" style={{ fontSize: "1.5rem" }}>{value}</p>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {delta}
        </span>
        <Sparkline data={trend} tone={tone} />
      </div>
    </div>
  );
}

function Sparkline({ data, tone }: { data: number[]; tone: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 24;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / Math.max(1, max - min)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke: Record<string, string> = {
    blue: "#3b82f6", amber: "#f59e0b", emerald: "#10b981", violet: "#8b5cf6",
  };
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline fill="none" stroke={stroke[tone]} strokeWidth={1.5} points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DualLineChart({ a, b }: { a: number[]; b: number[] }) {
  const w = 600, h = 180, pad = 8;
  const all = [...a, ...b];
  const max = Math.max(...all), min = Math.min(...all);
  const toPts = (data: number[]) =>
    data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  const area = (data: number[]) => {
    const pts = toPts(data).split(" ");
    const first = pts[0].split(",")[0];
    const last = pts[pts.length - 1].split(",")[0];
    return `${first},${h - pad} ${pts.join(" ")} ${last},${h - pad}`;
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      <defs>
        <linearGradient id="gA" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gB" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + i * ((h - pad * 2) / 3)} y2={pad + i * ((h - pad * 2) / 3)}
          stroke="currentColor" strokeOpacity="0.08" />
      ))}
      <polygon points={area(a)} fill="url(#gA)" />
      <polygon points={area(b)} fill="url(#gB)" />
      <polyline points={toPts(a)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={toPts(b)} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Donut({ customers, dealers }: { customers: number; dealers: number }) {
  const total = Math.max(1, customers + dealers);
  const pctA = customers / total;
  const r = 50, c = 2 * Math.PI * r;
  return (
    <div className="flex justify-center">
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth={16} />
        <circle cx={70} cy={70} r={r} fill="none" stroke="#3b82f6" strokeWidth={16}
          strokeDasharray={`${c * pctA} ${c}`} transform="rotate(-90 70 70)" strokeLinecap="round" />
        <circle cx={70} cy={70} r={r} fill="none" stroke="#8b5cf6" strokeWidth={16}
          strokeDasharray={`${c * (1 - pctA)} ${c}`} strokeDashoffset={-c * pctA}
          transform="rotate(-90 70 70)" strokeLinecap="round" />
        <text x="70" y="68" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100" style={{ fontSize: 18 }}>{total}</text>
        <text x="70" y="86" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10 }}>users</text>
      </svg>
    </div>
  );
}

function KpiMini({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 border border-white/10">
      <p className="text-[10px] uppercase tracking-wider text-white/50">{label}</p>
      <p className="tracking-tight" style={{ fontSize: "1.1rem" }}>{value}</p>
      <p className={`text-[10px] flex items-center gap-0.5 justify-center ${up ? "text-emerald-300" : "text-rose-300"}`}>
        {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />} {delta}
      </p>
    </div>
  );
}

function ScopeButton({ label, active, onClick, icon: Icon, count }: {
  label: string; active: boolean; onClick: () => void; icon: typeof Users; count: number;
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
      }`}>
      <Icon className="size-4" />
      <span>{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded ${active ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>{count}</span>
    </button>
  );
}

function RoleBadge({ role }: { role: "customer" | "dealer" }) {
  return role === "dealer" ? (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
      <Building2 className="size-3" /> Dealer
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
      <UserIcon className="size-3" /> Customer
    </span>
  );
}

const ACTIVITY_TONE: Record<"blue" | "emerald" | "amber" | "violet" | "rose", string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

function Analytics({ listings, users, reports }: { listings: AdminListing[]; users: AdminUser[]; reports: Report[] }) {
  const { banners, media, history, registry, values } = useElements();
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;

  const seed = useMemo(() => listings.length + users.length + reports.length + days, [listings.length, users.length, reports.length, days]);
  const rnd = (n: number, base: number, jitter: number) => {
    let x = Math.sin(seed * 9301 + n * 49297) * 233280;
    x = x - Math.floor(x);
    return Math.round(base + (x - 0.5) * jitter * 2);
  };

  const views = useMemo(() => Array.from({ length: days }, (_, i) => Math.max(50, rnd(i, 800 + i * 12, 250))), [days, seed]);
  const leads = useMemo(() => views.map((v, i) => Math.max(5, Math.round(v * (0.04 + (rnd(i + 100, 10, 6) / 1000))))), [views]);
  const revenueDaily = useMemo(() => Array.from({ length: days }, (_, i) => Math.max(2000, rnd(i + 200, 18000 + i * 90, 6000))), [days, seed]);

  const totalViews = views.reduce((a, b) => a + b, 0);
  const totalLeads = leads.reduce((a, b) => a + b, 0);
  const conv = ((totalLeads / Math.max(1, totalViews)) * 100).toFixed(2);
  const arpu = (revenueDaily.reduce((a, b) => a + b, 0) / Math.max(1, users.length)).toFixed(0);
  const half = Math.floor(views.length / 2);
  const viewsTrend = ((views.slice(half).reduce((a, b) => a + b, 0) - views.slice(0, half).reduce((a, b) => a + b, 0)) / Math.max(1, views.slice(0, half).reduce((a, b) => a + b, 0)) * 100);
  const leadsTrend = ((leads.slice(half).reduce((a, b) => a + b, 0) - leads.slice(0, half).reduce((a, b) => a + b, 0)) / Math.max(1, leads.slice(0, half).reduce((a, b) => a + b, 0)) * 100);

  const categoryStats = [
    { cat: "motors", label: "Motors", icon: Car, color: "#2563eb" },
    { cat: "property", label: "Property", icon: Home, color: "#16a34a" },
    { cat: "classifieds", label: "Classifieds", icon: Smartphone, color: "#a855f7" },
  ].map((c) => {
    const items = listings.filter((l) => l.category === c.cat);
    return {
      ...c,
      count: items.length,
      value: items.reduce((s, l) => s + l.price, 0),
      views: items.length ? rnd(c.cat.length, 2000 * items.length, 800) : 0,
      leads: items.length ? rnd(c.cat.length + 50, 80 * items.length, 30) : 0,
      avg: items.length ? Math.round(items.reduce((s, l) => s + l.price, 0) / items.length) : 0,
    };
  });
  const maxCat = Math.max(1, ...categoryStats.map((c) => c.count));

  const byLoc: Record<string, number> = {};
  listings.forEach((l) => { byLoc[l.location] = (byLoc[l.location] || 0) + 1; });
  const locs = Object.entries(byLoc).sort((a, b) => b[1] - a[1]);
  const maxLoc = Math.max(1, ...locs.map(([, v]) => v));

  const status = {
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
  };
  const statusTotal = Math.max(1, status.approved + status.pending + status.rejected);

  const topSellers = useMemo(() => {
    const map = new Map<string, { name: string; ads: number; revenue: number; role: "customer" | "dealer" }>();
    listings.forEach((l) => {
      const m = map.get(l.seller) || { name: l.seller, ads: 0, revenue: 0, role: l.sellerRole };
      m.ads++; m.revenue += l.price; map.set(l.seller, m);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [listings]);

  const funnel = [
    { label: "Page views", value: totalViews, color: "#3b82f6" },
    { label: "Listing detail", value: Math.round(totalViews * 0.42), color: "#6366f1" },
    { label: "Phone / Chat", value: totalLeads, color: "#a855f7" },
    { label: "Conversions", value: Math.round(totalLeads * 0.18), color: "#ec4899" },
  ];
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.value));

  const pageHealth = [
    { page: "Landing", icon: Sparkles, score: 98, traffic: Math.round(totalViews * 0.34), color: "emerald" },
    { page: "Browse", icon: Search, score: 94, traffic: Math.round(totalViews * 0.41), color: "emerald" },
    { page: "Detail", icon: Eye, score: 96, traffic: Math.round(totalViews * 0.18), color: "emerald" },
    { page: "Post Ad", icon: FileText, score: 88, traffic: Math.round(totalViews * 0.04), color: "amber" },
    { page: "Auth", icon: ShieldCheck, score: 99, traffic: Math.round(totalViews * 0.02), color: "emerald" },
    { page: "Profile", icon: UserIcon, score: 92, traffic: Math.round(totalViews * 0.01), color: "emerald" },
  ];

  const trafficSources = [
    { src: "Organic search", pct: 38, color: "#3b82f6" },
    { src: "Direct", pct: 24, color: "#10b981" },
    { src: "Social", pct: 18, color: "#a855f7" },
    { src: "Referral", pct: 12, color: "#f59e0b" },
    { src: "Email", pct: 8, color: "#ef4444" },
  ];

  const devices = [
    { name: "Mobile", pct: 64, color: "#3b82f6" },
    { name: "Desktop", pct: 28, color: "#a855f7" },
    { name: "Tablet", pct: 8, color: "#10b981" },
  ];

  const enabledBanners = banners.filter((b) => b.enabled).length;
  const customisedTexts = Object.keys(values).length;

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-6 relative overflow-hidden">
        <div className="absolute -top-12 -end-12 size-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -start-16 size-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex items-center gap-4 flex-wrap">
          <span className="size-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <BarChart3 className="size-6" />
          </span>
          <div className="flex-1 min-w-[200px]">
            <p className="tracking-tight" style={{ fontSize: "1.4rem" }}>Ninja Analytics</p>
            <p className="text-sm text-white/70">Live signals across every page · {listings.length} listings · {users.length} users · {reports.length} reports</p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-white/10 backdrop-blur border border-white/20">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-sm transition ${range === r ? "bg-white text-slate-900" : "text-white/80 hover:bg-white/10"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <AnalyticsKpi label="Page views" value={totalViews.toLocaleString()} trend={viewsTrend} icon={Eye} tint="from-blue-400 to-blue-600" series={views} />
          <AnalyticsKpi label="Leads" value={totalLeads.toLocaleString()} trend={leadsTrend} icon={MousePointerClick} tint="from-violet-400 to-violet-600" series={leads} />
          <AnalyticsKpi label="Conversion" value={`${conv}%`} trend={leadsTrend - viewsTrend} icon={Zap} tint="from-emerald-400 to-emerald-600" series={leads.map((l, i) => Math.round((l / Math.max(1, views[i])) * 1000))} />
          <AnalyticsKpi label="ARPU" value={`AED ${Number(arpu).toLocaleString()}`} trend={viewsTrend / 2} icon={DollarSign} tint="from-amber-400 to-amber-600" series={revenueDaily} />
        </div>
      </div>

      {/* Dual-line chart */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-blue-600" />
            <p className="tracking-tight">Traffic & leads over {days} days</p>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-600" /> Views</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-violet-600" /> Leads</span>
          </div>
        </div>
        <DualAreaChart series1={views} series2={leads} color1="#3b82f6" color2="#a855f7" />
      </div>

      {/* Category + Funnel */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><Tag className="size-4 text-blue-600" /> Performance by category</p>
          <div className="space-y-4">
            {categoryStats.map((c) => (
              <div key={c.cat} className="grid grid-cols-[120px_1fr_auto] items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="size-8 rounded-md flex items-center justify-center text-white" style={{ background: c.color }}>
                    <c.icon className="size-4" />
                  </span>
                  <span className="text-sm">{c.label}</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{c.count} listings · {c.views.toLocaleString()} views · {c.leads} leads</span>
                    <span>avg AED {(c.avg / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(c.count / maxCat) * 100}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}aa)` }} />
                  </div>
                </div>
                <span className="text-sm tabular-nums">AED {(c.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><TrendingUp className="size-4 text-blue-600" /> Conversion funnel</p>
          <div className="space-y-3">
            {funnel.map((f, i) => (
              <div key={f.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{f.label}</span>
                  <span className="text-slate-500 tabular-nums">{f.value.toLocaleString()}</span>
                </div>
                <div className="h-7 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${(f.value / maxFunnel) * 100}%`, background: `linear-gradient(90deg, ${f.color}, ${f.color}aa)` }} />
                </div>
                {i < funnel.length - 1 && (
                  <p className="text-[10px] text-slate-400 mt-1">↓ {((funnel[i + 1].value / Math.max(1, f.value)) * 100).toFixed(1)}% drop-off</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status pie + Locations heatmap + Devices */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><CheckCircle2 className="size-4 text-blue-600" /> Listing moderation</p>
          <DonutChart segments={[
            { label: "Approved", value: status.approved, color: "#10b981" },
            { label: "Pending", value: status.pending, color: "#f59e0b" },
            { label: "Rejected", value: status.rejected, color: "#ef4444" },
          ]} total={statusTotal} centerLabel="Listings" />
          <div className="mt-4 space-y-1.5">
            {[
              { label: "Approved", v: status.approved, c: "#10b981" },
              { label: "Pending", v: status.pending, c: "#f59e0b" },
              { label: "Rejected", v: status.rejected, c: "#ef4444" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: s.c }} />{s.label}</span>
                <span className="text-slate-500 tabular-nums">{s.v} · {((s.v / statusTotal) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><MapPin className="size-4 text-blue-600" /> Listings by location</p>
          <div className="space-y-2.5">
            {locs.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
            {locs.map(([loc, n]) => (
              <div key={loc}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{loc}</span><span className="text-slate-500 tabular-nums">{n} · {((n / listings.length) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${(n / maxLoc) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><Smartphone className="size-4 text-blue-600" /> Devices & sources</p>
          <p className="text-xs text-slate-500 mb-2">Device split</p>
          <div className="flex h-3 rounded-full overflow-hidden mb-2">
            {devices.map((d) => <div key={d.name} style={{ width: `${d.pct}%`, background: d.color }} />)}
          </div>
          <div className="space-y-1 mb-4">
            {devices.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: d.color }} />{d.name}</span>
                <span className="text-slate-500 tabular-nums">{d.pct}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mb-2">Traffic sources</p>
          <div className="space-y-1.5">
            {trafficSources.map((s) => (
              <div key={s.src} className="flex items-center gap-2">
                <span className="text-sm flex-1">{s.src}</span>
                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${s.pct * 2.5}%`, background: s.color }} />
                </div>
                <span className="text-xs text-slate-500 w-8 text-end tabular-nums">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top sellers + Page health */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><TrendingUp className="size-4 text-blue-600" /> Top sellers</p>
          <div className="space-y-2.5">
            {topSellers.length === 0 && <p className="text-sm text-slate-500">No sellers yet.</p>}
            {topSellers.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center text-sm">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm">{s.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${s.role === "dealer" ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"}`}>
                      {s.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{s.ads} ad{s.ads === 1 ? "" : "s"}</p>
                </div>
                <span className="text-sm tabular-nums">AED {(s.revenue / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><Activity className="size-4 text-blue-600" /> Page health</p>
          <div className="space-y-2.5">
            {pageHealth.map((p) => (
              <div key={p.page} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3">
                <span className="size-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <p.icon className="size-4 text-slate-600 dark:text-slate-300" />
                </span>
                <div>
                  <p className="text-sm">{p.page}</p>
                  <p className="text-xs text-slate-500 tabular-nums">{p.traffic.toLocaleString()} views</p>
                </div>
                <div className="w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${p.score}%` }} />
                </div>
                <span className={`text-sm tabular-nums ${p.color === "emerald" ? "text-emerald-600" : "text-amber-600"}`}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Elements link, users mix, reports */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><Users className="size-4 text-blue-600" /> Users mix</p>
          <DonutChart segments={[
            { label: "Customers", value: users.filter((u) => u.role === "customer").length, color: "#3b82f6" },
            { label: "Dealers", value: users.filter((u) => u.role === "dealer").length, color: "#a855f7" },
            { label: "Admins", value: users.filter((u) => u.role === "admin").length, color: "#10b981" },
          ]} total={users.length} centerLabel="Users" />
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Stat icon={ShieldCheck} label="Verified" value={users.filter((u) => u.verified).length} color="emerald" />
            <Stat icon={Ban} label="Banned" value={users.filter((u) => u.banned).length} color="rose" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><Flag className="size-4 text-blue-600" /> Reports & moderation</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">Open</p>
              <p className="tabular-nums text-amber-900 dark:text-amber-100" style={{ fontSize: "1.4rem" }}>{reports.filter((r) => r.status === "open").length}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Resolved</p>
              <p className="tabular-nums text-emerald-900 dark:text-emerald-100" style={{ fontSize: "1.4rem" }}>{reports.filter((r) => r.status === "resolved").length}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {reports.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-slate-50 dark:bg-slate-800/50">
                <span className="truncate">#{r.listingId} · {r.reason}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${r.status === "open" ? "bg-amber-200 text-amber-800" : "bg-emerald-200 text-emerald-800"}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="tracking-tight mb-4 flex items-center gap-2"><Wand2 className="size-4 text-blue-600" /> Elements signals</p>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={ImageIcon} label="Active banners" value={`${enabledBanners}/${banners.length}`} color="blue" />
            <Stat icon={Sparkles} label="Customised texts" value={customisedTexts} color="violet" />
            <Stat icon={ImageIcon} label="Media library" value={media.length} color="pink" />
            <Stat icon={Clock} label="Edits logged" value={history.length} color="amber" />
            <Stat icon={Tag} label="Registered" value={Object.keys(registry).length} color="slate" />
            <Stat icon={Heart} label="Reach" value={`${(totalViews / 1000).toFixed(1)}k`} color="rose" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Every public page registers its texts here — edits propagate instantly.</p>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <p className="tracking-tight mb-4 flex items-center gap-2"><Clock className="size-4 text-blue-600" /> Live activity</p>
        <div className="space-y-2.5">
          {([
            { icon: FileText, tone: "blue" as const, txt: `New listing pending review · ${listings.find((l) => l.status === "pending")?.title || "—"}`, t: "2m ago" },
            { icon: UserCheck, tone: "emerald" as const, txt: `Dealer verified · ${users.find((u) => u.role === "dealer" && u.verified)?.name || "—"}`, t: "14m ago" },
            { icon: Flag, tone: "amber" as const, txt: `New report · ${reports[0]?.reason || "—"}`, t: "33m ago" },
            { icon: MessageCircle, tone: "violet" as const, txt: `${Math.round(totalLeads / days * 1.2)} new leads today`, t: "1h ago" },
            { icon: Globe2, tone: "rose" as const, txt: `Traffic spike from ${trafficSources[0].src}`, t: "3h ago" },
            { icon: Wand2, tone: "blue" as const, txt: `${history[0]?.summary || "No recent edits"}`, t: history[0] ? new Date(history[0].ts).toLocaleTimeString() : "—" },
          ]).map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <span className={`size-8 rounded-md flex items-center justify-center ${ACTIVITY_TONE[a.tone]}`}>
                <a.icon className="size-4" />
              </span>
              <p className="text-sm flex-1 truncate">{a.txt}</p>
              <span className="text-xs text-slate-500">{a.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsKpi({ label, value, trend, icon: Icon, tint, series }: {
  label: string; value: string; trend: number; icon: any; tint: string; series: number[];
}) {
  const up = trend >= 0;
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4 relative overflow-hidden">
      <div className={`absolute -end-6 -top-6 size-20 rounded-full bg-gradient-to-br ${tint} opacity-30 blur-xl`} />
      <div className="relative flex items-center justify-between mb-2">
        <span className={`size-8 rounded-md bg-gradient-to-br ${tint} flex items-center justify-center`}>
          <Icon className="size-4 text-white" />
        </span>
        <span className={`text-xs inline-flex items-center gap-0.5 ${up ? "text-emerald-300" : "text-rose-300"}`}>
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
      <p className="relative text-xs text-white/70">{label}</p>
      <p className="relative tracking-tight tabular-nums" style={{ fontSize: "1.4rem" }}>{value}</p>
      <AreaSparkline series={series} className="mt-2 h-8 w-full opacity-80" stroke="#ffffff" />
    </div>
  );
}

function AreaSparkline({ series, stroke = "#3b82f6", className }: { series: number[]; stroke?: string; className?: string }) {
  if (series.length === 0) return null;
  const w = 100, h = 30;
  const min = Math.min(...series), max = Math.max(...series);
  const range = max - min || 1;
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <polygon points={area} fill={stroke} opacity={0.15} />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}

function DualAreaChart({ series1, series2, color1, color2 }: {
  series1: number[]; series2: number[]; color1: string; color2: string;
}) {
  const w = 800, h = 200, pad = 24;
  const all = [...series1, ...series2];
  const min = Math.min(...all), max = Math.max(...all);
  const range = max - min || 1;
  const toPts = (s: number[]) =>
    s.map((v, i) => `${pad + (i / (s.length - 1)) * (w - pad * 2)},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(" ");
  const pts1 = toPts(series1), pts2 = toPts(series2);
  const area1 = `${pad},${h - pad} ${pts1} ${w - pad},${h - pad}`;
  const area2 = `${pad},${h - pad} ${pts2} ${w - pad},${h - pad}`;
  const grid = [0.25, 0.5, 0.75].map((g) => h - pad - g * (h - pad * 2));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-52">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color1} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color1} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color2} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color2} stopOpacity={0} />
        </linearGradient>
      </defs>
      {grid.map((y, i) => <line key={i} x1={pad} x2={w - pad} y1={y} y2={y} stroke="currentColor" opacity={0.08} />)}
      <polygon points={area1} fill="url(#g1)" />
      <polygon points={area2} fill="url(#g2)" />
      <polyline points={pts1} fill="none" stroke={color1} strokeWidth={2} />
      <polyline points={pts2} fill="none" stroke={color2} strokeWidth={2} />
    </svg>
  );
}

function DonutChart({ segments, total, centerLabel }: {
  segments: { label: string; value: number; color: string }[]; total: number; centerLabel: string;
}) {
  const size = 160, stroke = 22, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={stroke} />
        {segments.map((s) => {
          const pct = total ? s.value / total : 0;
          const dash = pct * c;
          const circle = (
            <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset} />
          );
          offset += dash;
          return circle;
        })}
        <g transform={`rotate(90 ${size / 2} ${size / 2})`}>
          <text x={size / 2} y={size / 2 - 4} textAnchor="middle" className="fill-current" style={{ fontSize: 22 }}>{total}</text>
          <text x={size / 2} y={size / 2 + 14} textAnchor="middle" className="fill-current" style={{ fontSize: 10, opacity: 0.5 }}>{centerLabel}</text>
        </g>
      </svg>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300",
    pink: "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <div className={`rounded-lg p-2.5 ${map[color] || map.slate}`}>
      <div className="flex items-center gap-1.5 text-xs opacity-80"><Icon className="size-3.5" /> {label}</div>
      <p className="tabular-nums" style={{ fontSize: "1.05rem" }}>{value}</p>
    </div>
  );
}

function Toggle({ label, desc, initial }: { label: string; desc: string; initial?: boolean }) {
  const [on, setOn] = useState(!!initial);
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <p className="text-slate-900 dark:text-slate-100">{label}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition ${on ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
        aria-pressed={on}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${on ? "start-5" : "start-0.5"}`} />
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: ListingStatus }) {
  const map: Record<ListingStatus, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    rejected: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${map[status]}`}>{status}</span>;
}

function IconBtn({
  children, onClick, title, tone = "default",
}: {
  children: React.ReactNode; onClick: () => void; title: string;
  tone?: "default" | "success" | "warn" | "danger";
}) {
  const tones: Record<string, string> = {
    default: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
    success: "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
    warn: "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40",
    danger: "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40",
  };
  return (
    <button title={title} onClick={onClick} className={`size-8 rounded-md flex items-center justify-center transition ${tones[tone]}`}>
      {children}
    </button>
  );
}

