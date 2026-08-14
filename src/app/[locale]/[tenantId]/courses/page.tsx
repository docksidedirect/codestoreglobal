"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function TenantCoursesPage({ params }: { params: { tenantId: string } }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tenant/${params.tenantId}/dashboard`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setCourses(d.data?.recentCourses || []); setLoading(false); });
  }, [params.tenantId]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Courses</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <Card key={c.id} className="flex flex-col">
            <CardHeader>
              <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center"><BookOpen className="h-8 w-8 text-muted-foreground" /></div>
              <CardTitle className="text-lg">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {c.moduleCount} modules</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.durationMinutes || 0}m</span>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <Badge variant="secondary">{c.difficulty || "BEGINNER"}</Badge>
                <span className="font-bold">{formatCurrency(Number(c.price))}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
