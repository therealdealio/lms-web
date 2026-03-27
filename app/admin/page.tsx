"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Eye,
  MessageSquare,
  UserPlus,
  BarChart2,
  Trash2,
} from "lucide-react";

const ADMIN_EMAIL = "rrthai88@gmail.com";

import { domains, getDomainNumber } from "@/lib/curriculum";

interface DomainProgress {
  domainId: string;
  completed: boolean;
  examScore: number | null;
  examAttempts: number;
}

interface Membership {
  tier: string;
  promptsUsed: number;
  promptLimit: number | null;
  upgradedAt: string | null;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  membership: Membership | null;
  domainProgress: DomainProgress[];
}

interface DailySeries {
  date: string;
  visits: number;
  prompts: number;
  signups: number;
}

interface Analytics {
  totals: { visits: number; prompts: number; signups30d: number };
  series: DailySeries[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [promptInputs, setPromptInputs] = useState<Record<string, string>>({});
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeChart, setActiveChart] = useState<"visits" | "prompts" | "signups">("visits");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated" && session?.user?.email !== ADMIN_EMAIL) {
      router.push("/dashboard");
      return;
    }
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    setLoading(true);
    const [usersRes, analyticsRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/analytics"),
    ]);
    if (usersRes.ok) {
      const data = await usersRes.json();
      setUsers(Array.isArray(data) ? data : data.users ?? []);
    }
    if (analyticsRes.ok) {
      const data = await analyticsRes.json();
      console.log("analytics data:", data);
      setAnalytics(data);
    } else {
      console.error("analytics fetch failed:", analyticsRes.status, await analyticsRes.text());
    }
    setLoading(false);
  };

  const updateUser = async (userId: string, body: object) => {
    setSaving(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    }
    setSaving(null);
  };

  const toggleMembership = (user: User) => {
    const newTier = user.membership?.tier === "pro" ? "free" : "pro";
    updateUser(user.id, {
      membership: { tier: newTier, promptsUsed: user.membership?.promptsUsed ?? 0 },
    });
  };

  const setPromptsRemaining = (user: User) => {
    const raw = promptInputs[user.id] ?? "";
    const desired = parseInt(raw, 10);
    if (isNaN(desired) || desired < 0) return;
    const currentUsed = user.membership?.promptsUsed ?? 0;
    updateUser(user.id, {
      membership: {
        tier: "pro",
        promptsUsed: currentUsed,
        promptLimit: currentUsed + desired,
      },
    });
  };

  const toggleDomain = (user: User, domainId: string) => {
    const existing = user.domainProgress.find((d) => d.domainId === domainId);
    const isCompleted = existing?.completed ?? false;
    const courseId = domainId.substring(0, domainId.lastIndexOf("-"));
    updateUser(user.id, {
      domain: {
        courseId,
        domainId,
        completed: !isCompleted,
        examScore: !isCompleted ? 100 : null,
      },
    });
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    setDeleting(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
    setDeleting(null);
  };

  const proCount = users.filter((u) => u.membership?.tier === "pro").length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-dark-700 bg-dark-950/90 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="w-9 h-9 rounded-xl shadow-sm" />
            <div>
              <div className="font-bold text-dark-50 text-sm leading-tight flex items-center gap-2">
                Admin Panel
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-semibold">
                  ADMIN
                </span>
              </div>
              <div className="text-xs text-dark-400">Anthropic Architecture Certification</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Users", value: users.length, color: "text-brand-600", bg: "bg-brand-50" },
            { icon: Zap, label: "Pro Users", value: proCount, color: "text-amber-600", bg: "bg-amber-50" },
            { icon: Shield, label: "Free Users", value: users.length - proCount, color: "text-emerald-600", bg: "bg-emerald-50" },
            {
              icon: CheckCircle,
              label: "Avg Domains Done",
              value: users.length
                ? Math.round(
                    users.reduce(
                      (sum, u) => sum + u.domainProgress.filter((d) => d.completed).length,
                      0
                    ) / users.length
                  )
                : 0,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="p-5 rounded-2xl bg-white border border-dark-700 shadow-sm space-y-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-dark-400 text-xs mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="space-y-4">
            {/* Analytics stat cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Eye, label: "Total Page Visits", value: analytics.totals.visits.toLocaleString(), color: "text-blue-600", bg: "bg-blue-50", key: "visits" as const },
                { icon: MessageSquare, label: "Total AI Prompts", value: analytics.totals.prompts.toLocaleString(), color: "text-violet-600", bg: "bg-violet-50", key: "prompts" as const },
                { icon: UserPlus, label: "New Signups (30d)", value: analytics.totals.signups30d.toLocaleString(), color: "text-teal-600", bg: "bg-teal-50", key: "signups" as const },
              ].map(({ icon: Icon, label, value, color, bg, key }) => (
                <button
                  key={key}
                  onClick={() => setActiveChart(key)}
                  className={`p-5 rounded-2xl border shadow-sm space-y-3 text-left transition-all ${
                    activeChart === key
                      ? "bg-white border-brand-400 ring-2 ring-brand-200"
                      : "bg-white border-dark-700 hover:border-dark-500"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-dark-400 text-xs mt-1">{label}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Bar chart */}
            <div className="rounded-2xl bg-white border border-dark-700 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 size={16} className="text-brand-600" />
                <h2 className="font-bold text-dark-50 text-sm">
                  {activeChart === "visits" ? "Daily Page Visits" : activeChart === "prompts" ? "Daily AI Prompts" : "Daily Signups"} — Last 30 Days
                </h2>
              </div>
              {(() => {
                const values = analytics.series.map((d) => d[activeChart]);
                const max = Math.max(...values, 1);
                const colorClass = activeChart === "visits" ? "bg-blue-400" : activeChart === "prompts" ? "bg-violet-400" : "bg-teal-400";
                const hoverClass = activeChart === "visits" ? "hover:bg-blue-500" : activeChart === "prompts" ? "hover:bg-violet-500" : "hover:bg-teal-500";
                return (
                  <div className="flex items-end gap-1 h-32">
                    {analytics.series.map((day, i) => {
                      const pct = (day[activeChart] / max) * 100;
                      const label = day.date.slice(5); // MM-DD
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div
                            className={`w-full rounded-t ${colorClass} ${hoverClass} transition-colors cursor-default`}
                            style={{ height: `${Math.max(pct, 2)}%` }}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-dark-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {label}: {day[activeChart]}
                          </div>
                          {(i === 0 || i === 14 || i === 29) && (
                            <span className="text-dark-500 text-xs" style={{ fontSize: "9px" }}>{label}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-2xl bg-white border border-dark-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-dark-700">
            <h2 className="font-bold text-dark-50 text-lg">All Users ({users.length})</h2>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center text-dark-400">No users yet.</div>
          ) : (
            <div className="divide-y divide-dark-700">
              {users.map((user) => {
                const isPro = user.membership?.tier === "pro";
                const completedDomains = user.domainProgress.filter((d) => d.completed).length;
                const isExpanded = expandedUser === user.id;
                const isSaving = saving === user.id;
                const isDeleting = deleting === user.id;
                const isAdmin = user.email === ADMIN_EMAIL;

                return (
                  <div key={user.id}>
                    {/* User row */}
                    <div className="p-5 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {(user.name || user.email)[0].toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-dark-50 text-sm">
                            {user.name || "—"}
                          </span>
                          {isPro && (
                            <span className="px-1.5 py-0.5 rounded-full bg-brand-600 text-white text-xs font-semibold">
                              PRO
                            </span>
                          )}
                          {user.email === ADMIN_EMAIL && (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-semibold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-dark-400 text-xs mt-0.5 truncate">{user.email}</div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6 text-xs text-dark-400">
                        <div className="text-center">
                          <div className="text-dark-50 font-semibold">{completedDomains}/8</div>
                          <div>Domains</div>
                        </div>
                        <div className="text-center">
                          <div className="text-dark-50 font-semibold">
                            {user.membership?.promptsUsed ?? 0}
                          </div>
                          <div>Prompts Used</div>
                        </div>
                        <div className="text-center">
                          <div className="text-dark-50 font-semibold">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                          <div>Joined</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMembership(user)}
                          disabled={isSaving}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                            isPro
                              ? "bg-dark-800 hover:bg-dark-700 text-dark-300"
                              : "bg-brand-600 hover:bg-brand-500 text-white"
                          }`}
                        >
                          {isSaving ? "..." : isPro ? "Downgrade" : "Upgrade Pro"}
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          disabled={isDeleting || isSaving || isAdmin}
                          title={isAdmin ? "Cannot delete admin account" : "Delete account"}
                          style={{
                            padding: "6px",
                            borderRadius: "8px",
                            color: isAdmin ? "#ccc" : "#f87171",
                            background: "transparent",
                            border: "none",
                            cursor: isAdmin ? "not-allowed" : "pointer",
                            opacity: isAdmin ? 0.4 : 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {isDeleting ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded domain controls */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-dark-800 bg-dark-900">
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-sm font-semibold text-dark-200">Domain Progress</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-dark-400 whitespace-nowrap">Set prompts remaining:</span>
                              <input
                                type="number"
                                min="0"
                                placeholder={String(Math.max(0, (user.membership?.promptLimit ?? 15) - (user.membership?.promptsUsed ?? 0)))}
                                value={promptInputs[user.id] ?? ""}
                                onChange={(e) => setPromptInputs((prev) => ({ ...prev, [user.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && setPromptsRemaining(user)}
                                className="w-20 px-2 py-1 rounded-lg bg-dark-800 border border-dark-600 text-dark-100 text-xs focus:outline-none focus:border-brand-400"
                              />
                              <button
                                onClick={() => setPromptsRemaining(user)}
                                disabled={isSaving || !promptInputs[user.id]}
                                className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors disabled:opacity-40"
                              >
                                Set
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {domains.map((domain) => {
                              const dp = user.domainProgress.find(
                                (d) => d.domainId === domain.id
                              );
                              const done = dp?.completed ?? false;
                              const num = getDomainNumber(domain.id);
                              return (
                                <button
                                  key={domain.id}
                                  onClick={() => toggleDomain(user, domain.id)}
                                  disabled={isSaving}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all disabled:opacity-50 ${
                                    done
                                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                      : "bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-500 hover:text-dark-200"
                                  }`}
                                >
                                  {done ? (
                                    <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <XCircle size={13} className="text-dark-600 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{domain.courseId.toUpperCase()}-{num}: {domain.title.split(" ").slice(0, 2).join(" ")}</span>
                                </button>
                              );
                            })}
                          </div>
                          {user.membership && (
                            <p className="text-xs text-dark-500">
                              {isPro ? "Pro" : "Free"} · {user.membership.promptsUsed} used · {Math.max(0, (user.membership.promptLimit ?? 15) - user.membership.promptsUsed)} remaining (limit: {user.membership.promptLimit ?? 15})
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
