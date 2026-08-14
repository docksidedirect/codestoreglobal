"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";

export default function ChatPage({ params }: { params: { locale: string; tenantId: string } }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/tenant/${params.tenantId}/chat`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []));
  }, [params.tenantId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const res = await fetch(`/api/tenant/${params.tenantId}/chat`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input, roomId: "demo-general-room" }),
    });
    if (res.ok) { setInput(""); const d = await res.json(); setMessages((m) => [...m, d.message]); }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <Card className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${m.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <p className="text-sm">{m.content}</p>
              <p className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </Card>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." />
        <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
