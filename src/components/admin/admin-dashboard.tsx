"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Ban,
  Play,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  subscriptionTier: string;
  isVerified: boolean;
  createdAt: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  _count: {
    members: number;
    courses: number;
    products: number;
    jobListings: number;
  };
}

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  tenant: { id: string; name: string } | null;
}

const statusStyle: Record<string, string> = {
  ACTIVE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  PENDING_APPROVAL:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  SUSPENDED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  REJECTED: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const TIERS = ["FREE", "STARTER", "PRO", "ENTERPRISE"];
const ROLES = ["SUPERADMIN", "TENANT_ADMIN", "MEMBER", "FREELANCER"];

async function call(url: string, method: string, body?: any) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server error ${res.status}`);
  }
  if (!res.ok || !data.success)
    throw new Error(data.error || `Server error ${res.status}`);
  return data;
}

export function AdminDashboard() {
  const [tab, setTab] = useState<"overview" | "tenants" | "users">("overview");
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{
    type: "ok" | "err";
    text: string;
    password?: string;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [t, u] = await Promise.all([
        call("/api/admin/tenants", "GET"),
        call("/api/admin/users", "GET"),
      ]);
      setTenants(t.tenants);
      setUsers(u.users);
    } catch (e: any) {
      setNotice({ type: "err", text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function run(id: string, fn: () => Promise<any>) {
    setBusyId(id);
    setNotice(null);
    try {
      const data = await fn();
      if (data?.generatedPassword) {
        setNotice({
          type: "ok",
          text: "Created. Share this password with the user — it will not be shown again:",
          password: data.generatedPassword,
        });
      } else {
        setNotice({ type: "ok", text: "Done" });
      }
      await reload();
    } catch (e: any) {
      setNotice({ type: "err", text: e.message });
    } finally {
      setBusyId(null);
    }
  }

  // ---- inline edit state
  const [editTenant, setEditTenant] = useState<string | null>(null);
  const [editTenantForm, setEditTenantForm] = useState({
    name: "",
    subscriptionTier: "FREE",
    status: "ACTIVE",
  });
  const [editUser, setEditUser] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    firstName: "",
    lastName: "",
    role: "MEMBER",
  });

  // ---- add forms
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [addTenant, setAddTenant] = useState({
    name: "",
    subdomain: "",
    subscriptionTier: "FREE",
    ownerEmail: "",
    ownerFirstName: "",
    ownerLastName: "",
  });
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUser, setAddUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "MEMBER",
    tenantId: "",
  });

  const [copied, setCopied] = useState(false);
  function copyPw() {
    if (!notice?.password) return;
    navigator.clipboard.writeText(notice.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const pending = tenants.filter((t) => t.status === "PENDING_APPROVAL");
  const activeTenants = tenants.filter((t) => t.status === "ACTIVE");
  const activeUsers = users.filter((u) => u.isActive);
  const suspendedUsers = users.filter((u) => !u.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin Control Panel</h1>
          <p className="text-sm text-muted-foreground">
            Manage every workspace and user on the platform
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={reload}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["overview", "tenants", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors ${
              tab === t
                ? "bg-white dark:bg-slate-900 border border-b-0 border-slate-200 dark:border-slate-800 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "tenants"
              ? `Workspaces (${tenants.length})`
              : t === "users"
                ? `Users (${users.length})`
                : "Overview"}
          </button>
        ))}
      </div>

      {notice && (
        <div
          className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${notice.type === "ok" ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40" : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40"}`}
        >
          {notice.type === "err" ? (
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
          )}
          <div className="min-w-0">
            <p
              className={
                notice.type === "err"
                  ? "text-red-700 dark:text-red-300 font-medium"
                  : "text-emerald-700 dark:text-emerald-300 font-medium"
              }
            >
              {notice.text}
            </p>
            {notice.password && (
              <div className="mt-2 flex items-center gap-2">
                <code className="rounded bg-white dark:bg-slate-900 border dark:border-slate-700 px-2 py-1 text-xs font-mono">
                  {notice.password}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPw}
                  className="gap-1 h-7"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}{" "}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && tenants.length === 0 && users.length === 0 ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : tab === "overview" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Workspaces",
              value: tenants.length,
              icon: Building2,
            },
            {
              label: "Active Workspaces",
              value: activeTenants.length,
              icon: CheckCircle2,
            },
            {
              label: "Pending Approval",
              value: pending.length,
              icon: ShieldAlert,
              warn: pending.length > 0,
            },
            { label: "Total Users", value: users.length, icon: Users },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon
                  className={`h-4 w-4 ${s.warn ? "text-amber-500" : "text-muted-foreground"}`}
                />
              </div>
              <p
                className={`text-3xl font-bold ${s.warn ? "text-amber-600" : ""}`}
              >
                {s.value}
              </p>
            </div>
          ))}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground mb-2">Active Users</p>
            <p className="text-3xl font-bold">{activeUsers.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground mb-2">Stopped Users</p>
            <p className="text-3xl font-bold text-red-600">
              {suspendedUsers.length}
            </p>
          </div>
          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium mb-3">Newest signups</p>
            <div className="space-y-2">
              {users.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {u.firstName} {u.lastName}{" "}
                    <span className="text-muted-foreground">({u.email})</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : tab === "tenants" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowAddTenant(!showAddTenant)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Workspace
            </Button>
          </div>

          {showAddTenant && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <p className="text-sm font-medium">New workspace</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Workspace name *"
                  value={addTenant.name}
                  onChange={(e) =>
                    setAddTenant({ ...addTenant, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Subdomain (optional)"
                  value={addTenant.subdomain}
                  onChange={(e) =>
                    setAddTenant({ ...addTenant, subdomain: e.target.value })
                  }
                />
                <Input
                  placeholder="Owner email *"
                  value={addTenant.ownerEmail}
                  onChange={(e) =>
                    setAddTenant({ ...addTenant, ownerEmail: e.target.value })
                  }
                />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={addTenant.subscriptionTier}
                  onChange={(e) =>
                    setAddTenant({
                      ...addTenant,
                      subscriptionTier: e.target.value,
                    })
                  }
                >
                  {TIERS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <Input
                  placeholder="Owner first name"
                  value={addTenant.ownerFirstName}
                  onChange={(e) =>
                    setAddTenant({
                      ...addTenant,
                      ownerFirstName: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Owner last name"
                  value={addTenant.ownerLastName}
                  onChange={(e) =>
                    setAddTenant({
                      ...addTenant,
                      ownerLastName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={busyId === "__addTenant"}
                  onClick={() =>
                    run("__addTenant", () =>
                      call("/api/admin/tenants", "POST", addTenant).then(
                        (d) => {
                          setShowAddTenant(false);
                          setAddTenant({
                            name: "",
                            subdomain: "",
                            subscriptionTier: "FREE",
                            ownerEmail: "",
                            ownerFirstName: "",
                            ownerLastName: "",
                          });
                          return d;
                        },
                      ),
                    )
                  }
                >
                  {busyId === "__addTenant" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create workspace"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddTenant(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-3 font-medium">Workspace</th>
                  <th className="p-3 font-medium">Owner</th>
                  <th className="p-3 font-medium">Plan</th>
                  <th className="p-3 font-medium">Members</th>
                  <th className="p-3 font-medium">Products</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <TenantRowView
                    key={t.id}
                    t={t}
                    busy={busyId === t.id}
                    editOpen={editTenant === t.id}
                    editForm={editTenantForm}
                    onStartEdit={() => {
                      setEditTenant(t.id);
                      setEditTenantForm({
                        name: t.name,
                        subscriptionTier: t.subscriptionTier,
                        status: t.status,
                      });
                    }}
                    onCancelEdit={() => setEditTenant(null)}
                    onEditForm={setEditTenantForm}
                    onSaveEdit={() =>
                      run(t.id, () =>
                        call(
                          `/api/admin/tenants/${t.id}`,
                          "PATCH",
                          editTenantForm,
                        ),
                      ).then(() => setEditTenant(null))
                    }
                    onSetStatus={(status: string) =>
                      run(t.id, () =>
                        call(`/api/admin/tenants/${t.id}`, "PATCH", { status }),
                      )
                    }
                    onDelete={() => {
                      if (
                        window.confirm(
                          `Delete workspace "${t.name}" and ALL its data? This cannot be undone.`,
                        )
                      )
                        run(t.id, () =>
                          call(`/api/admin/tenants/${t.id}`, "DELETE"),
                        );
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowAddUser(!showAddUser)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </div>

          {showAddUser && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <p className="text-sm font-medium">New user</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Email *"
                  value={addUser.email}
                  onChange={(e) =>
                    setAddUser({ ...addUser, email: e.target.value })
                  }
                />
                <Input
                  placeholder="First name *"
                  value={addUser.firstName}
                  onChange={(e) =>
                    setAddUser({ ...addUser, firstName: e.target.value })
                  }
                />
                <Input
                  placeholder="Last name"
                  value={addUser.lastName}
                  onChange={(e) =>
                    setAddUser({ ...addUser, lastName: e.target.value })
                  }
                />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={addUser.role}
                  onChange={(e) =>
                    setAddUser({ ...addUser, role: e.target.value })
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:col-span-2"
                  value={addUser.tenantId}
                  onChange={(e) =>
                    setAddUser({ ...addUser, tenantId: e.target.value })
                  }
                >
                  <option value="">No workspace (platform user)</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={busyId === "__addUser"}
                  onClick={() =>
                    run("__addUser", () =>
                      call("/api/admin/users", "POST", addUser).then((d) => {
                        setShowAddUser(false);
                        setAddUser({
                          email: "",
                          firstName: "",
                          lastName: "",
                          role: "MEMBER",
                          tenantId: "",
                        });
                        return d;
                      }),
                    )
                  }
                >
                  {busyId === "__addUser" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create user"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-3 font-medium">User</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Workspace</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserRowView
                    key={u.id}
                    u={u}
                    busy={busyId === u.id}
                    editOpen={editUser === u.id}
                    editForm={editUserForm}
                    onStartEdit={() => {
                      setEditUser(u.id);
                      setEditUserForm({
                        firstName: u.firstName,
                        lastName: u.lastName,
                        role: u.role,
                      });
                    }}
                    onCancelEdit={() => setEditUser(null)}
                    onEditForm={setEditUserForm}
                    onSaveEdit={() =>
                      run(u.id, () =>
                        call(`/api/admin/users/${u.id}`, "PATCH", editUserForm),
                      ).then(() => setEditUser(null))
                    }
                    onToggleActive={() =>
                      run(u.id, () =>
                        call(`/api/admin/users/${u.id}`, "PATCH", {
                          isActive: !u.isActive,
                        }),
                      )
                    }
                    onDelete={() => {
                      if (
                        window.confirm(
                          `Delete user ${u.email}? This cannot be undone.`,
                        )
                      )
                        run(u.id, () =>
                          call(`/api/admin/users/${u.id}`, "DELETE"),
                        );
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TenantRowView({
  t,
  busy,
  editOpen,
  editForm,
  onStartEdit,
  onCancelEdit,
  onEditForm,
  onSaveEdit,
  onSetStatus,
  onDelete,
}: any) {
  if (editOpen) {
    return (
      <tr className="border-b bg-amber-50/50 dark:bg-amber-950/20">
        <td className="p-3" colSpan={3}>
          <div className="flex flex-col gap-2">
            <Input
              value={editForm.name}
              onChange={(e: any) =>
                onEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Workspace name"
            />
            <div className="flex gap-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={editForm.subscriptionTier}
                onChange={(e: any) =>
                  onEditForm({ ...editForm, subscriptionTier: e.target.value })
                }
              >
                {TIERS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={editForm.status}
                onChange={(e: any) =>
                  onEditForm({ ...editForm, status: e.target.value })
                }
              >
                <option>PENDING_APPROVAL</option>
                <option>ACTIVE</option>
                <option>SUSPENDED</option>
                <option>REJECTED</option>
              </select>
            </div>
          </div>
        </td>
        <td className="p-3 text-muted-foreground text-xs" colSpan={2}>
          save to apply
        </td>
        <td className="p-3" colSpan={2}>
          <div className="flex gap-1 justify-end">
            <Button size="sm" onClick={onSaveEdit} disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <td className="p-3">
        <p className="font-medium">{t.name}</p>
        <p className="text-xs text-muted-foreground">
          {t.subdomain}.codestoreglobal.com
        </p>
      </td>
      <td className="p-3 text-muted-foreground">
        {t.owner ? `${t.owner.firstName} ${t.owner.lastName}` : "—"}
        <p className="text-xs">{t.owner?.email}</p>
      </td>
      <td className="p-3">
        <Badge variant="outline" className="text-xs">
          {t.subscriptionTier}
        </Badge>
      </td>
      <td className="p-3">{t._count.members}</td>
      <td className="p-3">{t._count.products}</td>
      <td className="p-3">
        <Badge className={`text-xs ${statusStyle[t.status] || ""}`}>
          {t.status.replace("_", " ")}
        </Badge>
      </td>
      <td className="p-3">
        <div className="flex gap-1 justify-end flex-wrap">
          {t.status === "PENDING_APPROVAL" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-emerald-700"
                onClick={() => onSetStatus("ACTIVE")}
                disabled={busy}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-red-600"
                onClick={() => onSetStatus("REJECTED")}
                disabled={busy}
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}
          {t.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-red-600"
              onClick={() => onSetStatus("SUSPENDED")}
              disabled={busy}
            >
              <Ban className="h-3.5 w-3.5" /> Stop
            </Button>
          )}
          {(t.status === "SUSPENDED" || t.status === "REJECTED") && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-emerald-700"
              onClick={() => onSetStatus("ACTIVE")}
              disabled={busy}
            >
              <Play className="h-3.5 w-3.5" /> Reactivate
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7"
            onClick={onStartEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-red-500 hover:text-red-600"
            onClick={onDelete}
            disabled={busy}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function UserRowView({
  u,
  busy,
  editOpen,
  editForm,
  onStartEdit,
  onCancelEdit,
  onEditForm,
  onSaveEdit,
  onToggleActive,
  onDelete,
}: any) {
  if (editOpen) {
    return (
      <tr className="border-b bg-amber-50/50 dark:bg-amber-950/20">
        <td className="p-3">
          <div className="flex gap-2">
            <Input
              value={editForm.firstName}
              onChange={(e: any) =>
                onEditForm({ ...editForm, firstName: e.target.value })
              }
              placeholder="First name"
              className="h-9"
            />
            <Input
              value={editForm.lastName}
              onChange={(e: any) =>
                onEditForm({ ...editForm, lastName: e.target.value })
              }
              placeholder="Last name"
              className="h-9"
            />
          </div>
        </td>
        <td className="p-3">
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={editForm.role}
            onChange={(e: any) =>
              onEditForm({ ...editForm, role: e.target.value })
            }
          >
            {ROLES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </td>
        <td className="p-3 text-muted-foreground text-xs">
          {u.tenant?.name || "—"}
        </td>
        <td className="p-3" />
        <td className="p-3">
          <div className="flex gap-1 justify-end">
            <Button size="sm" onClick={onSaveEdit} disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <td className="p-3">
        <p className="font-medium">
          {u.firstName} {u.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{u.email}</p>
      </td>
      <td className="p-3">
        <Badge variant="outline" className="text-xs">
          {u.role.replace("_", " ")}
        </Badge>
      </td>
      <td className="p-3 text-muted-foreground">{u.tenant?.name || "—"}</td>
      <td className="p-3">
        <Badge
          className={`text-xs ${u.isActive ? statusStyle.ACTIVE : statusStyle.SUSPENDED}`}
        >
          {u.isActive ? "ACTIVE" : "STOPPED"}
        </Badge>
      </td>
      <td className="p-3">
        <div className="flex gap-1 justify-end">
          <Button
            size="sm"
            variant="outline"
            className={`h-7 gap-1 ${u.isActive ? "text-red-600" : "text-emerald-700"}`}
            onClick={onToggleActive}
            disabled={busy}
          >
            {u.isActive ? (
              <>
                <Ban className="h-3.5 w-3.5" /> Stop
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Activate
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7"
            onClick={onStartEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-red-500 hover:text-red-600"
            onClick={onDelete}
            disabled={busy}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
