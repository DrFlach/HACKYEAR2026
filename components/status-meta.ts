// Shared status -> {label, colour classes, icon} mapping, so the verdict
// banner, the per-check list and the action protocol render status
// consistently. Every class is a full static string so Tailwind can see it.

import type { ComponentType } from "react";
import type { CheckStatus } from "@/lib/checks/types";
import type { Verdict } from "@/lib/checks/verdict";
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon } from "./icons";

export interface StatusMeta {
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  /** Solid fill, for small accent bars/dots. */
  solidClass: string;
  Icon: ComponentType<{ className?: string }>;
}

export const CHECK_STATUS_META: Record<CheckStatus, StatusMeta> = {
  PASS: {
    label: "Pass",
    textClass: "text-pass",
    bgClass: "bg-pass/10",
    borderClass: "border-pass/30",
    solidClass: "bg-pass",
    Icon: CheckCircleIcon,
  },
  WARN: {
    label: "Warning",
    textClass: "text-warn",
    bgClass: "bg-warn/10",
    borderClass: "border-warn/30",
    solidClass: "bg-warn",
    Icon: AlertTriangleIcon,
  },
  FAIL: {
    label: "Fail",
    textClass: "text-fail",
    bgClass: "bg-fail/10",
    borderClass: "border-fail/30",
    solidClass: "bg-fail",
    Icon: XCircleIcon,
  },
  UNAVAILABLE: {
    label: "Unavailable",
    textClass: "text-slate-500",
    bgClass: "bg-slate-100",
    borderClass: "border-slate-300",
    solidClass: "bg-slate-400",
    Icon: InfoIcon,
  },
};

export interface VerdictMeta {
  textClass: string;
  bgClass: string;
  borderClass: string;
  solidClass: string;
  /** Soft tinted gradient for the hero verdict banner. */
  gradientClass: string;
  /** Top border accent for verdict-coloured cards. */
  topBorderClass: string;
  Icon: ComponentType<{ className?: string }>;
}

export const VERDICT_META: Record<Verdict, VerdictMeta> = {
  RED: {
    textClass: "text-fail",
    bgClass: "bg-fail/10",
    borderClass: "border-fail/40",
    solidClass: "bg-fail",
    gradientClass: "from-fail/15 via-fail/5 to-white",
    topBorderClass: "border-t-fail",
    Icon: XCircleIcon,
  },
  AMBER: {
    textClass: "text-warn",
    bgClass: "bg-warn/10",
    borderClass: "border-warn/40",
    solidClass: "bg-warn",
    gradientClass: "from-warn/15 via-warn/5 to-white",
    topBorderClass: "border-t-warn",
    Icon: AlertTriangleIcon,
  },
  GREEN: {
    textClass: "text-pass",
    bgClass: "bg-pass/10",
    borderClass: "border-pass/40",
    solidClass: "bg-pass",
    gradientClass: "from-pass/15 via-pass/5 to-white",
    topBorderClass: "border-t-pass",
    Icon: CheckCircleIcon,
  },
};
