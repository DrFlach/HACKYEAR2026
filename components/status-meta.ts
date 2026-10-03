// Shared status -> {label, color classes, icon} mapping, so the verdict
// banner and the per-check list render status consistently.

import type { ComponentType } from "react";
import type { CheckStatus } from "@/lib/checks/types";
import type { Verdict } from "@/lib/checks/verdict";
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon } from "./icons";

export interface StatusMeta {
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  Icon: ComponentType<{ className?: string }>;
}

export const CHECK_STATUS_META: Record<CheckStatus, StatusMeta> = {
  PASS: {
    label: "Pass",
    textClass: "text-pass",
    bgClass: "bg-pass/10",
    borderClass: "border-pass/30",
    Icon: CheckCircleIcon,
  },
  WARN: {
    label: "Warning",
    textClass: "text-warn",
    bgClass: "bg-warn/10",
    borderClass: "border-warn/30",
    Icon: AlertTriangleIcon,
  },
  FAIL: {
    label: "Fail",
    textClass: "text-fail",
    bgClass: "bg-fail/10",
    borderClass: "border-fail/30",
    Icon: XCircleIcon,
  },
  UNAVAILABLE: {
    label: "Unavailable",
    textClass: "text-slate-500",
    bgClass: "bg-slate-100",
    borderClass: "border-slate-300",
    Icon: InfoIcon,
  },
};

export const VERDICT_META: Record<
  Verdict,
  { textClass: string; bgClass: string; borderClass: string; Icon: ComponentType<{ className?: string }> }
> = {
  RED: { textClass: "text-fail", bgClass: "bg-fail/10", borderClass: "border-fail/40", Icon: XCircleIcon },
  AMBER: { textClass: "text-warn", bgClass: "bg-warn/10", borderClass: "border-warn/40", Icon: AlertTriangleIcon },
  GREEN: { textClass: "text-pass", bgClass: "bg-pass/10", borderClass: "border-pass/40", Icon: CheckCircleIcon },
};
