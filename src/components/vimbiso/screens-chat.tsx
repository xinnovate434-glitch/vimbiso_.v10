import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Mic, Send, Bot, User as UserIcon } from "lucide-react";
import { useVimbiso } from "@/lib/vimbiso/store";
import { assistReply, aiConfigured, welcomeScript } from "@/lib/vimbiso/ai";
import { parseDeal, draftToBidItem } from "@/lib/vimbiso/deal-desk";
import { canListen, listenOnce, speakAsync, stopSpeaking, unlockAudio, speak } from "@/lib/vimbiso/voice";
import { Badge, Btn, Card, IconBtn, Pad, TopBar } from "./primitives";
import { cn } from "@/lib/utils";

type ChatMsg = {
  id: string;
  from: "me" | "them" | "ai" | "system";
  text: string;
  at: string;
  name?: string;
};

async function loadNetworkCtx(userId: string | null) {
  try {
    const { listOnlineTraders } = await import("@/lib/vimbiso/api");
    const { data } = await listOnlineTraders();
    const others = (data || []).filter((u) => u.id !== userId);
    return {
      onlineTraders: others.length,
      sampleNames: others
        .map((u) => u.name || u.vimbiso_id || "")
        .filter(Boolean)
        .slice(0, 8),
    };
  } catch {
    return { onlineTraders: 0, sampleNames: [] as string[] };
  }
}

/** Vimby — text-first chat. Mic optional. Nav hidden; composer always on screen. */
export function AiAssistScreen() {
  const s = useVimbiso();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const [welcomeDone, setWelcomeDone] = useState(!!s.firstAiDone);
  const [voiceReply, setVoiceReply] = useState(true); // on by default — speak every reply
  const [listening, setListening] = useState(false);
  const [lastDraft, setLastDraft] = useState<ReturnType<typeof parseDeal>>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (s.firstAiDone) {
      setWelcomeDone(true);
      try { unlockAudio(); void speakAsync(welcomeScript(s.name, s.role).join(" ")); } catch { /* ignore */ }
      setMsgs([
        {
          id: "w0",
          from: "ai",
          name: "Vimby",
          text: `Hi ${s.name || "there"} — I'm Vimby. Type what you need to buy or sell on Vimbiso Network.`,
          at: "now",
        },
      ]);
      window.setTimeout(() => inputRef.current?.focus(), 400);
      return;
    }
    const lines = welcomeScript(s.name || undefined, s.role);
    let lineIdx = 0;
    let charIdx = 0;
    let current = "";
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (lineIdx >= lines.length) {
        setWelcomeDone(true);
      try { unlockAudio(); void speakAsync(welcomeScript(s.name, s.role).join(" ")); } catch { /* ignore */ }
        s.set({ firstAiDone: true });
        try {
          localStorage.setItem("vimbiso_first_ai", "1");
        } catch {
          /* ignore */
        }
        setMsgs([
          {
            id: "w-done",
            from: "ai",
            name: "Vimby",
            text: lines.join(" "),
            at: "now",
          },
        ]);
        setTyped("");
        window.setTimeout(() => inputRef.current?.focus(), 300);
        return;
      }
      const line = lines[lineIdx];
      if (charIdx < line.length) {
        current += line[charIdx];
        charIdx += 1;
        setTyped(current);
        window.setTimeout(tick, 14);
      } else {
        current += " ";
        lineIdx += 1;
        charIdx = 0;
        window.setTimeout(tick, 280);
      }
    };
    tick();
    return () => {
      cancelled = true;
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typed, busy]);

  async function runTurn(userText: string) {
    const t = userText.trim();
    if (!t || busy) return;
    unlockAudio();
    setMsgs((m) => [
      ...m,
      {
        id: String(Date.now()),
        from: "me",
        text: t,
        at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setBusy(true);
    try {
      const net = await loadNetworkCtx(s.userId);
      const reply = await assistReply(t, {
        role: s.role,
        city: s.city,
        name: s.name,
        onlineTraders: net.onlineTraders,
        sampleNames: net.sampleNames,
      });
      setMsgs((m) => [
        ...m,
        {
          id: String(Date.now() + 1),
          from: "ai",
          text: reply,
          at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          name: "Vimby",
        },
      ]);
      const draft = parseDeal(t, s.city);
      if (draft) {
        setLastDraft(draft);
        const item = draftToBidItem(draft);
        s.set({
          search: t,
          bidItem: item.name,
          bidQty: item.qty,
          bidUnit: item.unit,
          bidPrice: item.price || s.bidPrice,
          city: draft.city || s.city,
        });
      }
      if (voiceReply) {
        await speakAsync(reply);
        const ve = getLastVoiceError?.();
        if (ve) console.warn("voice:", ve);
      }
    } catch {
      const fallback =
        "I'm here for Vimbiso Network only. Type what you want to buy or sell, or open Build a bid.";
      setMsgs((m) => [
        ...m,
        { id: String(Date.now() + 2), from: "ai", text: fallback, at: "now", name: "Vimby" },
      ]);
      if (voiceReply) {
        try {
          await speakAsync(fallback);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setBusy(false);
      window.setTimeout(() => inputRef.current?.focus(), 150);
    }
  }

  async function optionalMic() {
    unlockAudio();
    if (busy || listening) return;
    if (!canListen()) {
      s.toastMsg("Type your message below — mic not required");
      inputRef.current?.focus();
      return;
    }
    try {
      setListening(true);
      const heard = await listenOnce("en-US", 10000);
      setListening(false);
      await runTurn(heard);
    } catch (e) {
      setListening(false);
      s.toastMsg("Type below instead — mic not needed");
      inputRef.current?.focus();
    }
  }

  return (
    <section
      className="vn-screen flex flex-col bg-[#f4f7fb]"
      style={{ position: "relative", height: "100%", maxHeight: "100%" }}
    >
      <TopBar
        left={
          <IconBtn
            onClick={() => {
              stopSpeaking();
              s.goHome();
            }}
          >
            <ChevronLeft />
          </IconBtn>
        }
        title="Vimby"
        right={
          <Badge tone={aiConfigured() ? "ok" : "live"}>
            {aiConfigured() ? "Online" : "Guide mode"}
          </Badge>
        }
      />

      {/* Messages — leave room for fixed composer (~72px) */}
      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4"
        style={{ paddingBottom: 8 }}
      >
        <div className="py-1 text-center">
          <div className="font-display text-lg font-extrabold tracking-tight text-navy">
            VIMBISO <span className="text-[#e0a32b]">NETWORK</span>
          </div>
          <p className="text-[11px] text-mut">Type to Vimby · trading help only</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => s.go("bid")}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy"
          >
            Build a bid
          </button>
          <button
            type="button"
            onClick={() => s.go("radar")}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy"
          >
            Network map
          </button>
          <button
            type="button"
            onClick={() => s.go("networkMore")}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy"
          >
            Network tools
          </button>
          <button
            type="button"
            onClick={() => setVoiceReply((v) => !v)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold",
              voiceReply ? "bg-teal text-white" : "border border-line bg-white text-navy",
            )}
          >
            {voiceReply ? "Voice replies on" : "Voice replies off"}
          </button>
        </div>

        {!welcomeDone && typed ? (
          <div className="flex justify-start gap-2">
            <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal text-white">
              <Bot className="size-4" />
            </span>
            <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-2.5 text-sm text-navy shadow-sm">
              <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-teal">Vimby</div>
              {typed}
              <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-teal" />
            </div>
          </div>
        ) : null}

        {msgs.map((m) => (
          <div
            key={m.id}
            className={cn("flex gap-2", m.from === "me" ? "justify-end" : "justify-start")}
          >
            {m.from !== "me" ? (
              <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal text-white">
                <Bot className="size-4" />
              </span>
            ) : null}
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug",
                m.from === "me"
                  ? "rounded-br-md bg-navy text-white"
                  : "rounded-bl-md border border-line bg-white text-navy shadow-sm",
              )}
            >
              {m.name && m.from !== "me" ? (
                <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-teal">
                  {m.name}
                </div>
              ) : null}
              {m.text}
            </div>
          </div>
        ))}
        {busy ? <div className="pl-10 text-xs text-mut">Vimby is thinking…</div> : null}
        {lastDraft ? (
          <div className="rounded-2xl border border-teal/30 bg-teal/5 p-3 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-wide text-teal">Vimby deal desk</div>
            <div className="mt-1 font-extrabold text-navy">
              {lastDraft.qty} {lastDraft.unit} {lastDraft.item}
              {lastDraft.maxPrice != null ? ` · max $${lastDraft.maxPrice}` : ""}
              {lastDraft.city ? ` · ${lastDraft.city}` : ""}
            </div>
            <p className="mt-1 text-[11px] text-mut">
              Structured from your words — post to the live network (no fake traders).
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-full bg-teal px-3 py-1.5 text-xs font-bold text-white"
                onClick={async () => {
                  const item = draftToBidItem(lastDraft);
                  const items = [...s.bidItems.filter((b) => b.name !== item.name), item];
                  s.set({ bidItems: items, bidItem: item.name, bidQty: item.qty, bidUnit: item.unit, bidPrice: item.price });
                  if (s.userId) {
                    try {
                      const { createBid } = await import("@/lib/vimbiso/api");
                      await createBid({ buyerId: s.userId, items, city: lastDraft.city || s.city });
                      s.toastMsg("Bid posted to Vimbiso Network");
                    } catch {
                      s.toastMsg("Bid saved — open Find traders");
                    }
                  }
                  s.go("radar");
                }}
              >
                Post live bid
              </button>
              <button
                type="button"
                className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy"
                onClick={() => s.go("bid")}
              >
                Edit bid
              </button>
            </div>
          </div>
        ) : null}
        {listening ? (
          <div className="text-center text-xs font-bold text-teal">Listening… (optional)</div>
        ) : null}
        <div ref={endRef} />
      </div>

      {/* ALWAYS visible text bar — fixed above any nav, high z-index */}
      <div
        className="shrink-0 border-t border-line bg-white shadow-[0_-4px_20px_rgba(14,42,71,0.08)]"
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 80,
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: 10,
          paddingBottom: "max(14px, env(safe-area-inset-bottom))",
        }}
      >
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const t = input.trim();
            if (!t) return;
            setInput("");
            void runTurn(t);
          }}
        >
          <button
            type="button"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#eef2f6] text-mut"
            onClick={() => void optionalMic()}
            aria-label="Optional voice"
            title="Optional — type is enough"
          >
            <Mic className="size-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            enterKeyHint="send"
            autoComplete="off"
            className="h-12 min-w-0 flex-1 rounded-full border-2 border-line bg-[#f4f7fb] px-4 text-base text-navy outline-none focus:border-teal"
            placeholder="Type to Vimby…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal text-white disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </section>
  );
}

export function MessagesScreen() {
  const s = useVimbiso();
  const [threads, setThreads] = useState<
    { id: string; name: string; preview: string }[]
  >([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { listOnlineTraders } = await import("@/lib/vimbiso/api");
        const { data } = await listOnlineTraders();
        if (cancelled) return;
        setThreads(
          (data || [])
            .filter((u) => u.id !== s.userId)
            .slice(0, 40)
            .map((u) => ({
              id: u.id,
              name: u.name || u.vimbiso_id || "Network user",
              preview: "Tap to chat · pay on collect",
            })),
        );
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
        text: "Chat here so there is a record. Pay in person when you collect.",
        at: "",
      },
      {
        id: "hi",
        from: "them",
        text: `Hi — ${name} on Vimbiso.`,
        at: "now",
        name,
      },
    ]);
    window.setTimeout(() => inputRef.current?.focus(), 300);
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
                className="mx-auto max-w-[92%] rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-center text-[11px] text-navy/80"
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
                      : "rounded-bl-md border border-line bg-white text-navy",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ),
          )}
        </div>
        <div
          className="shrink-0 border-t border-line bg-white px-3 pt-2"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              enterKeyHint="send"
              className="h-12 min-w-0 flex-1 rounded-full border border-line bg-[#f4f7fb] px-4 text-base outline-none focus:border-teal"
              placeholder="Write a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="grid h-12 w-12 place-items-center rounded-full bg-teal text-white"
            >
              <Send className="size-4" />
            </button>
          </form>
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
            <span className="block text-sm font-extrabold text-navy">Talk to Vimby</span>
            <span className="block text-xs text-mut">Type or speak — Vimbiso business only</span>
          </span>
        </button>
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-mut">
          People on the network
        </div>
        {threads.length === 0 ? (
          <Card>
            <div className="text-sm font-bold text-navy">No chats yet</div>
            <p className="mt-1 text-xs text-mut">
              When you match with a trader or customer, chat opens here. No demo people.
            </p>
            <Btn className="mt-3" variant="teal" onClick={() => s.go("ai")}>
              Ask Vimby instead
            </Btn>
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
          <div className="mx-auto mb-4 text-5xl">💳</div>
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
                ✓ Sent to buyer & seller
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
