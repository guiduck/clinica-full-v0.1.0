"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, SkipForward, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateUserUiPreferenceAction } from "@/actions/ui-preferences";
import { Button } from "@/components/ui/button";
import { ONBOARDING_STEPS, type OnboardingPlacement } from "./onboarding-steps";
import { isValidCpf } from "@/utils/validators/brazilian-documents";
import { cn } from "@/lib/utils";

type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
type Props = Readonly<{
  initialStep?: number;
  initiallyOpen?: boolean;
  userName: string;
  canAdvance?: boolean;
}>;
const GAP = 16,
  PAD = 8,
  CARD_WIDTH = 400;

function queryStep() {
  const p = new URLSearchParams(window.location.search);
  const n = Number(
    p.get("tourStep") ?? p.get("onboarding") ?? p.get("onboarging"),
  );
  return Number.isInteger(n) && n >= 1 && n <= ONBOARDING_STEPS.length
    ? n - 1
    : null;
}
function writeQuery(step: number | null) {
  const url = new URL(window.location.href);
  url.searchParams.delete("onboarging");
  url.searchParams.delete("onboarding");
  if (step === null) {
    url.searchParams.delete("tourStep");
  } else {
    url.searchParams.set("tourStep", String(step + 1));
  }
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}
function visibleRect(ids?: readonly string[]): Rect | null {
  const rs = (ids ?? [])
    .map((id) => document.getElementById(id)?.getBoundingClientRect())
    .filter((r): r is DOMRect => Boolean(r && r.width > 0 && r.height > 0));
  if (!rs.length) return null;
  const top = Math.min(...rs.map((r) => r.top)) - PAD,
    left = Math.min(...rs.map((r) => r.left)) - PAD,
    right = Math.max(...rs.map((r) => r.right)) + PAD,
    bottom = Math.max(...rs.map((r) => r.bottom)) + PAD;
  return {
    top,
    left,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}
function choosePlacement(
  preferred: OnboardingPlacement,
  target: Rect | null,
  cardHeight: number,
): OnboardingPlacement {
  if (!target || preferred === "center") return "center";
  if (target.bottom <= 0 || target.top >= innerHeight) return "center";
  if (innerWidth < 640 && (preferred === "left" || preferred === "right")) {
    return "center";
  }
  const room = {
    left: target.left,
    right: innerWidth - target.right,
    top: target.top,
    bottom: innerHeight - target.bottom,
  };
  const fits = {
    left: room.left >= CARD_WIDTH + GAP,
    right: room.right >= CARD_WIDTH + GAP,
    top: room.top >= cardHeight + GAP,
    bottom: room.bottom >= cardHeight + GAP,
  };
  if (fits[preferred as keyof typeof fits]) return preferred;
  return (
    (["bottom", "left", "right", "top"] as const).find((side) => fits[side]) ??
    "center"
  );
}

export function OnboardingTour({
  initialStep = 0,
  initiallyOpen = false,
  userName,
  canAdvance = true,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(initiallyOpen);
  const [step, setStep] = React.useState(() =>
    typeof window === "undefined" ? initialStep : (queryStep() ?? initialStep),
  );
  const [target, setTarget] = React.useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = React.useState(230);
  const [stepValid, setStepValid] = React.useState(true);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = React.useTransition();
  const current =
    ONBOARDING_STEPS[Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, step))];
  const persist = React.useCallback(
    (operation: Parameters<typeof updateUserUiPreferenceAction>[0]) =>
      startTransition(() => {
        void updateUserUiPreferenceAction(operation);
      }),
    [],
  );
  const move = React.useCallback(
    (next: number) => {
      const bounded = Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, next));
      setStep(bounded);
      writeQuery(bounded);
      persist({ operation: "advance_onboarding", step: bounded });
    },
    [persist],
  );
  React.useEffect(() => {
    const restart = () => {
      setStep(0);
      writeQuery(0);
      setOpen(true);
      window.dispatchEvent(new CustomEvent("onboarding:active"));
    };
    window.addEventListener("onboarding:restart", restart);
    return () => window.removeEventListener("onboarding:restart", restart);
  }, []);
  React.useEffect(() => {
    if (!open) return;
    const element = (current.targetIds ?? [])
      .map((id) => document.getElementById(id))
      .find((item): item is HTMLElement => Boolean(item));
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (
      (rect.top < GAP || rect.bottom > innerHeight - GAP) &&
      typeof element.scrollIntoView === "function"
    ) {
      element.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
    }
  }, [current.targetIds, open, step]);
  React.useEffect(() => {
    if (!open) return;
    let frame = 0;
    const measure = () => {
      setTarget(visibleRect(current.targetIds));
      if (cardRef.current) setCardHeight(cardRef.current.offsetHeight || 230);
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [current.targetIds, open]);
  React.useEffect(() => {
    if (!open) return;
    if (current.shellState === "navigation-open") {
      window.dispatchEvent(new CustomEvent("tour:navigation-open"));
    } else {
      window.dispatchEvent(new CustomEvent("tour:navigation-close"));
    }
    if (current.shellState === "user-menu-open") {
      window.dispatchEvent(new CustomEvent("tour:user-menu-force-open"));
    } else {
      window.dispatchEvent(new CustomEvent("tour:user-menu-force-close"));
    }
  }, [current.shellState, open, step]);
  React.useEffect(() => {
    if (!open) return;
    const name =
      current.advance === "user-menu"
        ? "tour:user-menu-opened"
        : current.advance === "settings-selected"
          ? "tour:settings-selected"
          : current.advance === "account-save"
            ? "tour:account-save-validated"
            : current.advance === "contact-save"
              ? "tour:contact-save-validated"
              : null;
    if (!name) return;
    const advance = () => {
      if (current.advance === "settings-selected") {
        const nextStep = Math.min(ONBOARDING_STEPS.length - 1, step + 1);
        setStep(nextStep);
        persist({ operation: "advance_onboarding", step: nextStep });
        return;
      }
      move(step + 1);
    };
    window.addEventListener(name, advance);
    return () => window.removeEventListener(name, advance);
  }, [current.advance, move, open, persist, step]);
  React.useEffect(() => {
    if (!open || current.advance !== "click-target") return;
    const els = (current.targetIds ?? [])
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => Boolean(e));
    const advance = () => window.setTimeout(() => move(step + 1), 100);
    els.forEach((e) => e.addEventListener("click", advance));
    return () => els.forEach((e) => e.removeEventListener("click", advance));
  }, [current.advance, current.targetIds, move, open, step, target]);
  React.useEffect(() => {
    if (!open || step !== 9) {
      setStepValid(true);
      return;
    }
    const input = document.querySelector<HTMLInputElement>(
      "#tour-settings-cpf input",
    );
    const validate = () => setStepValid(isValidCpf(input?.value ?? ""));
    validate();
    input?.addEventListener("input", validate);
    return () => input?.removeEventListener("input", validate);
  }, [open, step, target]);
  if (!open) return null;
  const placement = choosePlacement(
    current.placement ?? "bottom",
    target,
    cardHeight,
  );
  const clipPath = target
    ? `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${target.left}px ${target.top}px, ${target.left}px ${target.bottom}px, ${target.right}px ${target.bottom}px, ${target.right}px ${target.top}px, ${target.left}px ${target.top}px)`
    : undefined;
  const style: React.CSSProperties =
    placement === "center" || !target
      ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
      : placement === "left"
        ? {
            right: innerWidth - target.left + GAP,
            top: Math.max(
              GAP,
              Math.min(target.top, innerHeight - cardHeight - GAP),
            ),
          }
        : placement === "right"
          ? {
              left: target.right + GAP,
              top: Math.max(
                GAP,
                Math.min(target.top, innerHeight - cardHeight - GAP),
              ),
            }
          : placement === "top"
            ? {
                left: Math.max(
                  GAP,
                  Math.min(target.left, innerWidth - CARD_WIDTH - GAP),
                ),
                bottom: innerHeight - target.top + GAP,
              }
            : {
                left: Math.max(
                  GAP,
                  Math.min(target.left, innerWidth - CARD_WIDTH - GAP),
                ),
                top: target.bottom + GAP,
              };
  const finish = () => {
    persist({ operation: "complete_onboarding" });
    writeQuery(null);
    setOpen(false);
    window.dispatchEvent(new CustomEvent("onboarding:inactive"));
    router.push("/dashboard");
  };
  const skip = () => {
    persist({ operation: "skip_onboarding" });
    writeQuery(null);
    setOpen(false);
    window.dispatchEvent(new CustomEvent("onboarding:inactive"));
  };
  const mayAdvance = canAdvance && stepValid;
  const next = () => {
    if (!mayAdvance) return;
    if (step === ONBOARDING_STEPS.length - 1) {
      finish();
    } else {
      move(step + 1);
    }
  };
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-live="polite"
    >
      <div
        data-testid="onboarding-dim-layer"
        className="fixed inset-0 bg-slate-950/55"
        style={{ clipPath, pointerEvents: "none" }}
      />
      {target ? (
        <>
          <div
            aria-hidden
            className="pointer-events-auto fixed left-0 right-0 top-0 z-[105]"
            style={{ height: Math.max(0, target.top) }}
          />
          <div
            aria-hidden
            className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[105]"
            style={{ top: Math.min(innerHeight, target.bottom) }}
          />
          <div
            aria-hidden
            className="pointer-events-auto fixed left-0 z-[105]"
            style={{
              top: Math.max(0, target.top),
              width: Math.max(0, target.left),
              height: Math.max(
                0,
                Math.min(innerHeight, target.bottom) -
                  Math.max(0, target.top),
              ),
            }}
          />
          <div
            aria-hidden
            className="pointer-events-auto fixed right-0 z-[105]"
            style={{
              top: Math.max(0, target.top),
              left: Math.min(innerWidth, target.right),
              height: Math.max(
                0,
                Math.min(innerHeight, target.bottom) -
                  Math.max(0, target.top),
              ),
            }}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-auto fixed inset-0 z-[105]"
        />
      )}
      {target ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[110] rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-background"
          style={{
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
          }}
        />
      ) : null}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="onboarding-title"
        data-placement={placement}
        className="pointer-events-auto fixed z-[120] w-[min(360px,calc(100vw-2rem))] rounded-xl border bg-background p-5 shadow-2xl"
        style={style}
      >
        {placement !== "center" ? <span aria-hidden className={cn("absolute size-4 rotate-45 border bg-background", placement === "bottom" && "-top-2 left-8 border-b-0 border-r-0", placement === "top" && "-bottom-2 left-8 border-l-0 border-t-0", placement === "left" && "-right-2 top-8 border-b-0 border-l-0", placement === "right" && "-left-2 top-8 border-r-0 border-t-0")} /> : null}
        <button type="button" onClick={skip} className="absolute right-3 top-3 grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Fechar tutorial"><X className="size-4" /></button>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          Passo {step + 1} de {ONBOARDING_STEPS.length}
        </p>
        <h2 id="onboarding-title" className="mt-1 text-base font-semibold">
          {current.title.replace(
            "{userName}",
            userName.split(" ")[0] || "por aqui",
          )}
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {current.description}
        </p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-primary/10"><span className="block h-full bg-primary transition-[width] motion-reduce:transition-none" style={{ width: `${((step + 1) / ONBOARDING_STEPS.length) * 100}%` }} /></div>
        {current.advance && current.advance !== "next" ? <p className="mt-3 rounded-md bg-muted/70 px-3 py-2 text-xs italic text-muted-foreground">Clique no destaque para avançar</p> : null}
        {!mayAdvance ? <p className="mt-3 rounded-md bg-muted/70 px-3 py-2 text-xs italic text-muted-foreground">{current.blockedHint ?? "Complete o dado obrigatório destacado para continuar"}</p> : null}
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={skip}
          >
            <SkipForward className="size-4" /> Pular
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={step === 0 || isPending}
              onClick={() => move(step - 1)}
            >
              <ArrowLeft className="size-4" /> Voltar
            </Button>
            {!current.advance || current.advance === "next" ? (
              <Button
                aria-disabled={!mayAdvance}
                disabled={isPending}
                size="sm"
                onClick={next}
              >
                {step === ONBOARDING_STEPS.length - 1 ? "Concluir" : "Próximo"} <ArrowRight className="size-4" />
              </Button>
            ) : (
              null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
