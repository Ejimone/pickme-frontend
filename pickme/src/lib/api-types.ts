/**
 * API response types — hand-written from PICKME_API_REFERENCE.md §4.
 * The backend exports an OpenAPI schema (schema/openapi.yaml); when it lands
 * in this repo, generate types with openapi-typescript and replace this file.
 * Until then, this is the typed contract. Relations are bare UUID strings
 * unless noted as nested; several resources carry a *_name companion field.
 */

// ---- Shared ----
export type UUID = string;
/** UTC ISO-8601, e.g. "2026-07-07T15:00:00Z" */
export type ISODateTime = string;
/** "YYYY-MM-DD" */
export type ISODate = string;
/** "HH:MM" / "HH:MM:SS" */
export type ISOTime = string;

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Cursor-paginated (chat history only) — newest first. */
export interface CursorPaginated<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---- Status enums (single source for StatusBadge / lib/status.ts) ----
export type PickupEventStatus =
  | "scheduled"
  | "en_route"
  | "arrived"
  | "picked_up"
  | "missed"
  | "cancelled";

export type TripStatus = "not_started" | "in_progress" | "completed" | "cancelled";

export type TripStopStatus = "pending" | "en_route" | "arrived" | "picked_up" | "skipped";

export type AssignmentStatus =
  | "suggested"
  | "confirmed"
  | "swap_pending"
  | "completed"
  | "cancelled";

export type SwapRequestStatus = "pending" | "accepted" | "rejected" | "expired";

export type PickupMethod = "parent" | "carpool" | "aftercare" | "bus" | "walker";

export type NotificationType =
  | "pickup_reminder"
  | "driver_arrived"
  | "swap_request"
  | "chat_message"
  | "schedule_change"
  | "sos";

// ---- Resources ----
export interface UserSummary {
  id: UUID;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export interface Family {
  id: UUID;
  name: string;
  created_by: UUID;
  created_at: ISODateTime;
  member_count?: number;
}

export interface FamilyMember {
  id: UUID;
  user: UserSummary;
  role: "owner" | "member";
  joined_at: ISODateTime;
}

export interface FamilyInvite {
  id: UUID;
  family: UUID;
  email: string;
  status: "pending" | "accepted" | "revoked";
  created_at: ISODateTime;
}

export interface School {
  id: UUID;
  name: string;
  address: string;
  lat: string | null;
  lng: string | null;
  timezone: string;
  default_dismissal_time: ISOTime;
  early_dismissal_days: Record<string, string> | null;
  phone: string | null;
  created_at: ISODateTime;
}

export interface SchoolCalendarException {
  id: UUID;
  school: UUID;
  date: ISODate;
  dismissal_time: ISOTime | null; // null = NO SCHOOL that day
  reason: string;
  created_at: ISODateTime;
}

export interface Child {
  id: UUID;
  family: UUID;
  school: UUID | null;
  full_name: string;
  date_of_birth: ISODate | null;
  grade: string | null;
  photo_url: string | null;
  color_tag: string | null; // e.g. "#4F86C6"
  notes: string;
  created_at: ISODateTime;
}

export interface Activity {
  id: UUID;
  child: UUID;
  name: string;
  day_of_week: number; // 0 = Monday
  start_time: ISOTime;
  end_time: ISOTime;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  created_at: ISODateTime;
}

export interface CarpoolGroup {
  id: UUID;
  school: UUID;
  name: string;
  invite_code: string;
  created_by: UUID;
  created_at: ISODateTime;
}

export interface CarpoolGroupMember {
  id: UUID;
  family: UUID;
  family_name: string;
  role: "admin" | "member";
  joined_at: ISODateTime;
}

export interface RotationOrderEntry {
  family: UUID;
  family_name: string;
  position: number;
  weight?: number;
}

export interface CarpoolRotationRule {
  id: UUID;
  rotation_type: "round_robin" | "weighted" | "manual_only";
  cycle_days: number[];
  start_date: ISODate;
  order: RotationOrderEntry[];
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CarpoolAssignment {
  id: UUID;
  carpool_group: UUID;
  date: ISODate;
  driver_family: UUID;
  driver_family_name: string;
  driver_user: UUID | null;
  status: AssignmentStatus;
  is_auto_suggested: boolean;
  notes: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface CarpoolSwapRequest {
  id: UUID;
  assignment: UUID;
  requested_by: UUID;
  target_family: UUID;
  target_family_name: string;
  status: SwapRequestStatus;
  reason: string;
  created_at: ISODateTime;
  resolved_at: ISODateTime | null;
}

export interface TripStopChild {
  id: UUID;
  child: UUID;
  child_name: string;
  picked_up_at: ISODateTime | null;
}

export interface TripStop {
  id: UUID;
  school: UUID | null;
  activity: UUID | null;
  sequence_order: number;
  eta: ISODateTime | null;
  status: TripStopStatus;
  actual_arrival_time: ISODateTime | null;
  children: TripStopChild[];
}

export interface Trip {
  id: UUID;
  driver: UUID;
  driver_name: string;
  carpool_group: UUID | null;
  date: ISODate;
  status: TripStatus;
  started_at: ISODateTime | null;
  ended_at: ISODateTime | null;
  tracking_mode: "live_gps" | "status_only";
  created_at: ISODateTime;
  stops: TripStop[];
}

export interface LocationPing {
  id: number;
  lat: string;
  lng: string;
  speed: number | null;
  heading: number | null;
  recorded_at: ISODateTime;
}

export interface PickupEvent {
  id: UUID;
  child: UUID;
  child_name: string;
  date: ISODate;
  pickup_method: PickupMethod;
  carpool_assignment: UUID | null;
  trip_stop_child: UUID | null;
  status: PickupEventStatus;
  scheduled_time: ISODateTime | null;
  created_at: ISODateTime;
}

export interface ChatThread {
  id: UUID;
  context_type: "carpool_group" | "trip";
  carpool_group: UUID | null;
  trip: UUID | null;
  created_at: ISODateTime;
}

export interface ChatMessage {
  id: UUID;
  thread: UUID;
  sender: UUID;
  sender_name: string;
  content: string | null;
  attachment_url: string | null;
  message_type: "text" | "image" | "system";
  created_at: ISODateTime;
}

export interface Notification {
  id: UUID;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: ISODateTime;
}

export interface NotificationPreference {
  id: UUID;
  notification_type: NotificationType;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
}

export interface DeviceToken {
  id: UUID;
  token: string;
  platform: "ios" | "android";
  created_at: ISODateTime;
}

export interface SOSAlert {
  id: UUID;
  trip: UUID;
  raised_by: UUID;
  lat: string;
  lng: string;
  message: string;
  status: "active" | "resolved";
  created_at: ISODateTime;
  resolved_at: ISODateTime | null;
  resolved_by: UUID | null;
}
