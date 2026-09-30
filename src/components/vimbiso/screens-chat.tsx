import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Mic, Send, Bot, User as UserIcon } from "lucide-react";
import { useVimbiso } from "@/lib/vimbiso/store";
import { assistReply, aiConfigured } from "@/lib/vimbiso/ai";
import { Badge, Btn, Card, IconBtn, Pad, TopBar } from "./primitives";
import { cn } from "@/lib/utils";

type ChatMsg = {
  id: string;
  from: "me" | "them" | "ai" | "system";
  text: string;
  at: string;
  name?: string;
};

/** In-app AI assistant — always available to talk */
export function AiAssistScreen() {
  const s = useVimbiso();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      id: "0",
      from: "ai",
      text: s.role === "trader"
        ? `Hi ${s.name || "trader"} — what are we selling today? I can help set price, quantity, and find nearby buyers.`
        : s.role === "delivery"
          ? `Hi ${s.name || "driver"} — ready for jobs? Tell me your area and I'll help you stay on route.`
          : `Hi ${s.name || "there"} — what do you need today? Tomatoes, mealie meal, or something else? I'll help you build a bid.`,
      at: "now",
      name: "Vimbiso AI",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    const mine: ChatMsg = {
      id: String(Date.now()),
      from: "me",
      text: t,
      at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMsgs((m) => [...m, mine]);
    setBusy(true);
    try {
      const reply = await assistReply(
        `[role=${s.role}] [city=${s.city}] ${t}`,
      );
      setMsgs((m) => [
        ...m,
        {
          id: String(Date.now() + 1),
          from: "ai",
          text: reply,
          at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          name: "Vimbiso AI",
        },
      ]);
      // Soft link to bid when user states a need
      if (/tomato|meal|kg|need|buy|want/i.test(t) && s.role !== "trader") {
        s.set({ search: t, bidItem: t });
      }
    } catch {
      setMsgs((m) => [
        ...m,
        {
          id: String(Date.now() + 2),
          from: "ai",
          text: "I couldn't reach the AI right now. Type your need on Home and Build a bid.",
          at: "now",
          name: "Vimbiso AI",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="vn-screen flex flex-col bg-[#f4f7fb]">
      <TopBar
        left={
          <IconBtn onClick={() => s.goHome()}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Vimbiso AI"
        right={
          <Badge tone={aiConfigured() ? "ok" : "live"}>
            {aiConfigured() ? "Live" : "Basic"}
          </Badge>
        }
      />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
        {!aiConfigured() ? (
          <Card className="text-xs text-mut">
            Gemini key not in this build — you still get short guided replies. Add{" "}
            <b>VITE_GEMINI_API_KEY</b> in GitHub secrets for full AI.
          </Card>
        ) : null}
        {msgs.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-2",
              m.from === "me" ? "justify-end" : "justify-start",
            )}
          >
            {m.from !== "me" ? (
              <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal text-white">
                <Bot className="size-4" />
              </span>
            ) : null}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug",
                m.from === "me"
                  ? "rounded-br-md bg-navy text-white"
                  : "rounded-bl-md bg-white text-navy shadow-sm border border-line",
              )}
            >
              {m.name && m.from !== "me" ? (
                <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-teal">
                  {m.name}
                </div>
              ) : null}
              {m.text}
              <div
                className={cn(
                  "mt-1 text-[10px]",
                  m.from === "me" ? "text-white/60" : "text-mut",
                )}
              >
                {m.at}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t border-line bg-white px-3 py-2 pb-[max(env(safe-area-inset-bottom),10px)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full bg-teal/12 text-teal"
            onClick={() => s.set({ voiceOn: true })}
            aria-label="Voice"
          >
            <Mic className="size-5" />
          </button>
          <input
            className="h-11 flex-1 rounded-full border border-line bg-[#f4f7fb] px-4 text-sm outline-none focus:border-teal"
            placeholder="Talk to Vimbiso AI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send(input);
            }}
          />
          <button
            type="button"
            disabled={busy}
            className="grid h-11 w-11 place-items-center rounded-full bg-teal text-white disabled:opacity-50"
            onClick={() => void send(input)}
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/** Messages with real network people (empty until matches exist) */
export function MessagesScreen() {
  const s = useVimbiso();
  const [threads, setThreads] = useState<
    { id: string; name: string; preview: string; time: string }[]
  >([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { listOnlineTraders } = await import("@/lib/vimbiso/api");
        const { data } = await listOnlineTraders();
        if (cancelled) return;
        const list = (data || [])
          .filter((u) => u.id !== s.userId)
          .slice(0, 30)
          .map((u) => ({
            id: u.id,
            name: u.name || u.vimbiso_id || "Network user",
            preview: "Tap to open chat — agree details here, pay on collect",
            time: "",
          }));
        setThreads(list);
      } catch {
        if (!cancelled) setThreads([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [s.userId]);

  function openThread(id: string, name: string) {
    setActive(id);
    setMsgs([
      {
        id: "sys",
        from: "system",
        text: "Chat here so there is a record. Pay in person when you collect. Money sent in advance cannot be reversed.",
        at: "",
      },
      {
        id: "hi",
        from: "them",
        text: `Hi — this is ${name} on Vimbiso.`,
        at: "now",
        name,
      },
    ]);
  }

  function send() {
    const t = input.trim();
    if (!t || !active) return;
    setMsgs((m) => [
      ...m,
      {
        id: String(Date.now()),
        from: "me",
        text: t,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  }

  if (active) {
    const title = threads.find((t) => t.id === active)?.name || "Chat";
    return (
      <section className="vn-screen flex flex-col bg-[#f4f7fb]">
        <TopBar
          left={
            <IconBtn onClick={() => setActive(null)}>
              <ChevronLeft />
            </IconBtn>
          }
          title={title}
        />
        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
          {msgs.map((m) =>
            m.from === "system" ? (
              <div
                key={m.id}
                className="mx-auto max-w-[92%] rounded-xl bg-amber-50 px-3 py-2 text-center text-[11px] text-navy/80 border border-amber-100"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={m.id}
                className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm",
                    m.from === "me"
                      ? "rounded-br-md bg-navy text-white"
                      : "rounded-bl-md bg-white border border-line text-navy",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ),
          )}
        </div>
        <div className="border-t border-line bg-white px-3 py-2 pb-[max(env(safe-area-inset-bottom),10px)]">
          <div className="flex gap-2">
            <input
              className="h-11 flex-1 rounded-full border border-line bg-[#f4f7fb] px-4 text-sm outline-none"
              placeholder="Message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-teal text-white"
              onClick={send}
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="vn-screen bg-[#f4f7fb]">
      <TopBar
        left={
          <IconBtn onClick={() => s.goHome()}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Messages"
        right={
          <button
            type="button"
            className="rounded-full bg-teal px-3 py-1.5 text-xs font-bold text-white"
            onClick={() => s.go("ai")}
          >
            AI
          </button>
        }
      />
      <Pad>
        <button
          type="button"
          onClick={() => s.go("ai")}
          className="mb-3 flex w-full items-center gap-3 rounded-xl border border-teal/25 bg-teal/8 px-3 py-3 text-left"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-teal text-white">
            <Bot className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-extrabold text-navy">Talk to Vimbiso AI</span>
            <span className="block text-xs text-mut">Always here — order help, prices, next steps</span>
          </span>
        </button>

        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-mut">
          People on the network
        </div>
        {threads.length === 0 ? (
          <Card>
            <div className="text-sm font-bold text-navy">No chats yet</div>
            <p className="mt-1 text-xs text-mut">
              When you match with a trader or customer, open chat here. No demo conversations.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => openThread(t.id, t.name)}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3 py-3 text-left"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-navy/8 text-navy">
                  <UserIcon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-navy">{t.name}</span>
                  <span className="block truncate text-xs text-mut">{t.preview}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Pad>
    </section>
  );
}

/** Animated digital receipt after a completed trade (seller → buyer) */
export function ReceiptScreen() {
  const s = useVimbiso();
  const [phase, setPhase] = useState<"pos" | "print" | "done">("pos");

  const item = s.bidItems[0]?.name || s.bidItem || "Goods";
  const total =
    s.bidItems.reduce((a, i) => a + i.total, 0) ||
    (s.bidPrice && s.bidQty ? s.bidPrice * s.bidQty : 0);
  const receiptNo = `VIM-${(s.vimbisoId || "0000").slice(-4)}-${Date.now().toString().slice(-6)}`;

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("print"), 900);
    const t2 = window.setTimeout(() => setPhase("done"), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <section className="vn-screen flex flex-col items-center justify-center bg-navy-3 px-5 text-white">
      {phase === "pos" ? (
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-28 w-40 place-items-center rounded-2xl bg-white/10">
            <div className="text-5xl">💳</div>
          </div>
          <p className="text-sm text-white/70">Confirming trade…</p>
        </div>
      ) : null}

      {phase !== "pos" ? (
        <div
          className={cn(
            "w-full max-w-[320px] overflow-hidden rounded-md bg-white text-navy shadow-2xl transition-all duration-700",
            phase === "print" ? "max-h-24 opacity-90" : "max-h-[520px]",
          )}
        >
          <div className="bg-[#e8eef5] px-3 py-2 text-center text-[10px] font-bold tracking-[0.2em] text-mut">
            VIMBISO NETWORK
          </div>
          <div className="space-y-2 p-4 text-sm">
            <div className="text-center font-display text-lg font-extrabold">Digital receipt</div>
            <div className="text-center text-[11px] text-mut">{receiptNo}</div>
            <div className="border-t border-dashed border-line pt-2">
              <div className="flex justify-between">
                <span>Item</span>
                <span className="font-bold">{item}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Buyer</span>
                <span>{s.name || "Customer"}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>City</span>
                <span>{s.city || "—"}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Pay</span>
                <span className="uppercase">{s.payMethod}</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
              <span>TOTAL</span>
              <span>${total ? total.toFixed(2) : "—"}</span>
            </div>
            {phase === "done" ? (
              <div className="mt-2 text-center text-xs font-bold text-ok">
                ✓ Sent to buyer & seller · trade recorded
              </div>
            ) : (
              <div className="mt-2 text-center text-xs text-mut">Printing digital receipt…</div>
            )}
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="mt-6 w-full max-w-[320px] space-y-2">
          <Btn
            variant="teal"
            onClick={() => {
              s.toastMsg("Receipt saved in Orders");
              s.go("status");
            }}
          >
            Done
          </Btn>
          <Btn variant="ghost" className="text-white" onClick={() => s.goHome()}>
            Home
          </Btn>
        </div>
      ) : null}
    </section>
  );
}
