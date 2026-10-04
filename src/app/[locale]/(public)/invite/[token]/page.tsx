"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function InvitePage({ params }: { params: { locale: string; token: string } }) {
  const { locale, token } = params;
  const router = useRouter();

  const [invite, setInvite] = useState<{ email: string; tenantName: string } | null>(null);
  const [loadError, setLoadError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/invites/accept?token=${encodeURIComponent(token)}`);
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { /* fallthrough */ }
      if (!res.ok || !data.success) {
        setLoadError(data.error || "This invite link is invalid.");
      } else {
        setInvite({ email: data.email, tenantName: data.tenantName });
      }
    })();
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, firstName, lastName, password }),
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { throw new Error(`Server error ${res.status}`); }
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to join");
      router.push(`/${locale}/${data.user.tenantId}/dashboard`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
              <MailCheck className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <CardTitle>You&apos;re invited</CardTitle>
          </CardHeader>
          <CardContent>
            {loadError ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-red-500 font-medium">{loadError}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${locale}/login`}>Go to Sign In</Link>
                </Button>
              </div>
            ) : !invite ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  Join <strong className="text-foreground">{invite.tenantName}</strong> as{" "}
                  <strong className="text-foreground">{invite.email}</strong>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First name</Label>
                    <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Password (min 8 characters)</Label>
                  <Input
                    required
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Joining..." : "Create account & join"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
