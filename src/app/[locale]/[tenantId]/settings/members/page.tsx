"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, Copy, Check, Loader2, Users, Mail } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  expiresAt: string;
  usedAt: string | null;
}

export default function MembersPage({
  params,
}: {
  params: { locale: string; tenantId: string };
}) {
  const { locale, tenantId } = params;

  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tenant/${tenantId}/invites`, { cache: "no-store" });
    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { /* noop */ }
    if (res.ok && data.success) {
      setMembers(data.members || []);
      setInvites(data.invites || []);
    }
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCopied(false);
    setGeneratedLink("");
    setInviting(true);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { throw new Error(`Server error ${res.status}`); }
      if (!res.ok || !data.success) throw new Error(data.error || "Invite failed");
      const link = `${window.location.origin}/${locale}/invite/${data.invite.token}`;
      setGeneratedLink(link);
      setEmail("");
      await load();
    } catch (err: any) {
      setError(err.message || "Invite failed");
    } finally {
      setInviting(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    EXPIRED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/${locale}/${tenantId}/settings`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Invite Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={invite} className="flex gap-2">
            <Input
              type="email"
              required
              placeholder="colleague@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={inviting}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
            </Button>
          </form>
          {error && <p className="text-sm text-red-500 font-medium mt-2">{error}</p>}

          {generatedLink && (
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                Invite created — send this link to your teammate (valid 7 days):
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate text-xs bg-white dark:bg-slate-900 rounded px-2 py-1.5 border dark:border-slate-700">
                  {generatedLink}
                </code>
                <Button size="sm" variant="outline" onClick={copyLink} className="gap-1 shrink-0">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <div className="divide-y">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-sm font-semibold dark:bg-violet-950 dark:text-violet-300">
                      {(m.firstName?.[0] || "") + (m.lastName?.[0] || "")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {m.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{m.role}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {invites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2.5">
                  <p className="text-sm">{inv.email}</p>
                  <Badge className={`text-xs ${statusColor[inv.status] || ""}`}>{inv.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
