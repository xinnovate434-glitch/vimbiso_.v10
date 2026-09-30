import { useEffect, useState } from "react";
import { ChevronLeft, Moon, Sun, Bell, Shield, User, LogOut, Smartphone } from "lucide-react";
import { useVimbiso } from "@/lib/vimbiso/store";
import { Badge, Btn, Card, IconBtn, Pad, TopBar } from "./primitives";

const DARK_KEY = "vimbiso_dark_v1";

export function SettingsScreen() {
  const s = useVimbiso();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const on = localStorage.getItem(DARK_KEY) === "1";
      setDark(on);
      document.body.classList.toggle("vn-dark", on);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem(DARK_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    document.body.classList.toggle("vn-dark", next);
    s.toastMsg(next ? "Dark mode on" : "Dark mode off");
  }

  return (
    <section className="vn-screen bg-[#f4f7fb]">
      <TopBar
        left={
          <IconBtn onClick={() => s.go("profile")}>
            <ChevronLeft />
          </IconBtn>
        }
        title="Settings"
      />
      <Pad className="space-y-3 pb-24">
        <Card>
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-mut">Account</div>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-mut">Name</span>
              <span className="font-bold text-navy">{s.name || "—"}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-mut">Phone</span>
              <span className="font-bold text-navy">{s.phone || "—"}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-mut">Vimbiso ID</span>
              <span className="font-bold text-navy">{s.vimbisoId || "Pending"}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-mut">Status</span>
              <Badge tone={s.userStatus === "approved" ? "ok" : "live"}>
                {s.userStatus || "pending"}
              </Badge>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-mut">City</span>
              <span className="font-bold text-navy">{s.city || "—"}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-mut">Display</div>
          <button
            type="button"
            onClick={toggleDark}
            className="mt-2 flex w-full items-center justify-between py-2"
          >
            <span className="flex items-center gap-2 font-bold text-navy">
              {dark ? <Moon className="size-4 text-teal" /> : <Sun className="size-4 text-teal" />}
              Dark mode
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${dark ? "bg-navy text-white" : "bg-line text-mut"}`}
            >
              {dark ? "On" : "Off"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              s.toggleLite();
              s.toastMsg(s.lite ? "Lite mode off" : "Lite mode on — saves data");
            }}
            className="flex w-full items-center justify-between border-t border-line py-2"
          >
            <span className="flex items-center gap-2 font-bold text-navy">
              <Smartphone className="size-4 text-teal" />
              Lite mode (data saver)
            </span>
            <span className="text-xs font-bold text-mut">{s.lite ? "On" : "Off"}</span>
          </button>
        </Card>

        <Card>
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-mut">Network</div>
          <button
            type="button"
            className="mt-2 flex w-full items-center gap-2 py-2 font-bold text-navy"
            onClick={() => s.go("trust")}
          >
            <Shield className="size-4 text-teal" /> Trust & reputation
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 border-t border-line py-2 font-bold text-navy"
            onClick={() => s.go("ai")}
          >
            <User className="size-4 text-teal" /> Vimby assistant
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 border-t border-line py-2 font-bold text-navy"
            onClick={() => s.toastMsg("Notifications stay quiet until real network events")}
          >
            <Bell className="size-4 text-teal" /> Notifications
          </button>
        </Card>

        <Btn
          variant="navy"
          onClick={() => {
            s.signOut();
            s.toastMsg("Signed out");
          }}
        >
          <span className="inline-flex items-center gap-2">
            <LogOut className="size-4" /> Sign out
          </span>
        </Btn>

        <p className="text-center text-[10px] text-mut">Vimbiso Network · settings only</p>
      </Pad>
    </section>
  );
}
