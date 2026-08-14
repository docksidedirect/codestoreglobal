"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, UserPlus } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function MembersPage({ params }: { params: { tenantId: string } }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch(`/api/tenant/${params.tenantId}/dashboard`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setMembers([]); setLoading(false); });
  }, [params.tenantId]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    alert(`Invitation sent to ${email} (placeholder)`);
    setEmail("");
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
            <Button type="submit" className="gap-1"><UserPlus className="h-4 w-4" /> Invite</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">No additional members yet. Use the invite form above to grow your team.</p>
      </div>
    </div>
  );
}
