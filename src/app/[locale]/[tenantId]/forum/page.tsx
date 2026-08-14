"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, TrendingUp, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function ForumPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { locale, tenantId } = params;
  const [categories, setCategories] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/tenant/${tenantId}/forum/categories`, { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/tenant/${tenantId}/forum/threads`, { credentials: "include" }).then((r) => r.json()),
    ]).then(([catData, threadData]) => {
      setCategories(catData.categories || []);
      setThreads(threadData.threads || []);
      setLoading(false);
    });
  }, [tenantId]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">Discuss courses, products, jobs, and anything tech-related</p>
        </div>
        <Link href={`/${locale}/${tenantId}/forum/new`}><Button className="gap-1"><Plus className="h-4 w-4" /> New Thread</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/${locale}/${tenantId}/forum?category=${cat.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{cat._count.threads} threads</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                {cat.threads[0] && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Clock className="h-3 w-3" /> Last activity {new Date(cat.threads[0].updatedAt).toLocaleDateString()}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-8">Recent Discussions</h2>
      <div className="space-y-3">
        {threads.map((thread) => (
          <Card key={thread.id} className={thread.isPinned ? "border-primary/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold">{thread._count.votes}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/${locale}/${tenantId}/forum/thread/${thread.id}`} className="font-semibold hover:text-primary truncate">
                      {thread.isPinned && <Badge variant="default" className="mr-1 text-[10px] py-0">Pinned</Badge>}
                      {thread.title}
                    </Link>
                    <Badge style={{ backgroundColor: thread.category?.color + "20", color: thread.category?.color, borderColor: thread.category?.color + "40" }} variant="outline" className="text-xs">{thread.category?.name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{thread.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {thread.author.firstName} {thread.author.lastName}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {thread._count.posts} replies</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
