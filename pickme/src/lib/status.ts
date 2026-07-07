/**
 * The status color law — the single source of truth mapping every backend
 * status enum to a tone + icon, used by StatusBadge everywhere so status
 * language is identical across Today, Trip, and Rotation screens.
 *
 * Tone → color (FRONTEND-ARCHITECTURE.md §6, stricter on a monochrome canvas):
 *   live    = blue   (#276EF1) — en route, active trip, interactive
 *   done    = green  (#05A357) — confirmed, arrived, picked up
 *   pending = yellow (#FFC043) — suggested / awaiting swap (ALWAYS dark text)
 *   alert   = red    (#E11900) — SOS and missed ONLY
 *   neutral = gray                — everything else (scheduled, cancelled…)
 */
import {
  ArrowsLeftRight,
  Bus,
  Car,
  CheckCircle,
  Clock,
  House,
  type IconWeight,
  NavigationArrow,
  PersonSimpleWalk,
  Prohibit,
  Siren,
  XCircle,
} from "phosphor-react-native";
import type { ComponentType } from "react";

import type {
  AssignmentStatus,
  PickupEventStatus,
  PickupMethod,
  SwapRequestStatus,
  TripStatus,
  TripStopStatus,
} from "./api-types";

export type StatusTone = "live" | "done" | "pending" | "alert" | "neutral";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
  Icon: PhosphorIcon;
}

export type PhosphorIcon = ComponentType<{
  size?: number;
  color?: string;
  weight?: IconWeight;
}>;

export type AnyStatus =
  | PickupEventStatus
  | TripStatus
  | TripStopStatus
  | AssignmentStatus
  | SwapRequestStatus;

const STATUS_MAP: Record<string, StatusMeta> = {
  // shared / pickup + trip stop lifecycle
  scheduled: { label: "Scheduled", tone: "neutral", Icon: Clock },
  pending: { label: "Pending", tone: "neutral", Icon: Clock },
  not_started: { label: "Not started", tone: "neutral", Icon: Clock },
  en_route: { label: "En route", tone: "live", Icon: NavigationArrow },
  in_progress: { label: "In progress", tone: "live", Icon: NavigationArrow },
  arrived: { label: "Arrived", tone: "done", Icon: CheckCircle },
  picked_up: { label: "Picked up", tone: "done", Icon: CheckCircle },
  completed: { label: "Completed", tone: "done", Icon: CheckCircle },
  confirmed: { label: "Confirmed", tone: "done", Icon: CheckCircle },
  accepted: { label: "Accepted", tone: "done", Icon: CheckCircle },
  suggested: { label: "Suggested", tone: "pending", Icon: Clock },
  swap_pending: { label: "Swap pending", tone: "pending", Icon: ArrowsLeftRight },
  missed: { label: "Missed", tone: "alert", Icon: XCircle },
  cancelled: { label: "Cancelled", tone: "neutral", Icon: Prohibit },
  skipped: { label: "Skipped", tone: "neutral", Icon: Prohibit },
  rejected: { label: "Rejected", tone: "neutral", Icon: XCircle },
  expired: { label: "Expired", tone: "neutral", Icon: Prohibit },
  active: { label: "Active", tone: "alert", Icon: Siren },
  resolved: { label: "Resolved", tone: "done", Icon: CheckCircle },
};

export function statusMeta(status: string): StatusMeta {
  return (
    STATUS_MAP[status] ?? {
      label: status.replace(/_/g, " "),
      tone: "neutral",
      Icon: Clock,
    }
  );
}

/** Pickup-method → icon (Today card). */
export const PICKUP_METHOD_ICON: Record<PickupMethod, PhosphorIcon> = {
  parent: House,
  carpool: Car,
  aftercare: Clock,
  bus: Bus,
  walker: PersonSimpleWalk,
};

export const PICKUP_METHOD_LABEL: Record<PickupMethod, string> = {
  parent: "Parent",
  carpool: "Carpool",
  aftercare: "Aftercare",
  bus: "Bus",
  walker: "Walker",
};
