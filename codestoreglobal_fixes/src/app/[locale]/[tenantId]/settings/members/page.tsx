"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function MembersPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { tenantId } = params;
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/tenant/${tenantId}/dashboard`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setMembers(d.data?.members || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tenantId]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setInviting(true);
    try {
      const res = await fetch(`/api/tenant/${tenantId}/invites`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");
      setMessage(`Invitation sent to ${email}`);
      setEmail("");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setInviting(false);
    }
  }

  if (loading) return <Skeleton className="h-32" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Team Members</h1>
      <Card>
        <CardHeader><CardTitle>Invite Member</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={invite} className="flex gap-2">
            <Input type="email" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" disabled={inviting} className="gap-1"><UserPlus className="h-4 w-4" /> {inviting ? "Sending..." : "Invite"}</Button>
          </form>
          {message && <div className={`text-sm mt-2 ${message.includes("sent") ? "text-green-600" : "text-red-500"}`}>{message}</div>}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No additional members yet. Use the invite form above to grow your team.</p>
        ) : (
          members.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {getInitials(m.firstName, m.lastName)}
                  </div>
                  <div>
                    <p className="font-medium">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <Badge variant="outline">{m.role}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
