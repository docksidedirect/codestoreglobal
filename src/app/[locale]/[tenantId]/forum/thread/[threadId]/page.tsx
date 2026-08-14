"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageSquare, Eye, ThumbsUp, CheckCircle2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";

export default function ThreadPage({ params }: { params: { locale: string; tenantId: string; threadId: string } }) {
  const { locale, tenantId, threadId } = params;
  const [thread, setThread] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => { loadThread(); }, [threadId]);

  async function loadThread() {
    const res = await fetch(`/api/tenant/${tenantId}/forum/threads/${threadId}`, { credentials: "include" });
    if (res.ok) { const d = await res.json(); setThread(d.thread); }
    setLoading(false);
  }

  async function onReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    const res = await fetch(`/api/tenant/${tenantId}/forum/posts`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply, threadId }),
    });
    setSending(false);
    if (res.ok) { setReply(""); loadThread(); }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  if (!thread) return <div className="text-center py-12 text-muted-foreground">Thread not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href={`/${locale}/${tenantId}/forum`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to Forum</Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">{getInitials(thread.author.firstName, thread.author.lastName)}</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge style={{ backgroundColor: thread.category?.color + "20", color: thread.category?.color, borderColor: thread.category?.color + "40" }} variant="outline">{thread.category?.name}</Badge>
                {thread.isPinned && <Badge variant="default" className="text-[10px]">Pinned</Badge>}
                <span className="text-xs text-muted-foreground">{thread.author.firstName} {thread.author.lastName} · {new Date(thread.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-xl font-bold mb-2">{thread.title}</h1>
              <p className="text-sm whitespace-pre-wrap">{thread.content}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {thread.viewCount} views</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {thread._count.posts} replies</span>
                <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {thread._count.votes} votes</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" /> {thread.posts.length} Replies</h3>
        {thread.posts.map((post: any) => (
          <Card key={post.id} className={post.isSolution ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/10" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{getInitials(post.author.firstName, post.author.lastName)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{post.author.firstName} {post.author.lastName}</span>
                    <Badge variant="outline" className="text-[10px]">{post.author.role}</Badge>
                    {post.isSolution && <Badge className="bg-emerald-600 text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" /> Solution</Badge>}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={onReply} className="space-y-3">
            <h4 className="font-medium text-sm">Post a Reply</h4>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Share your thoughts..." className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <div className="flex justify-end"><Button type="submit" disabled={sending || !reply.trim()}>{sending ? "Posting..." : "Post Reply"}</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
