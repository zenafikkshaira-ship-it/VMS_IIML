import { Visit, VisitStatus } from "@prisma/client";
import { addMinutes, isAfter } from "date-fns";

export function isVisitOverstay(visit: Visit, bufferMinutes = 30): boolean {
  if (visit.status !== VisitStatus.CHECKED_IN || !visit.checkedInAt) {
    return false;
  }

  const allowedUntil = addMinutes(visit.checkedInAt, visit.durationMinutes + bufferMinutes);
  return isAfter(new Date(), allowedUntil);
}

export function getVisitValidity(visit: Visit): {
  validFrom: Date | null;
  validUntil: Date | null;
  isValid: boolean;
} {
  const now = new Date();

  if (visit.validFrom && visit.validUntil) {
    return {
      validFrom: visit.validFrom,
      validUntil: visit.validUntil,
      isValid: now >= visit.validFrom && now <= visit.validUntil,
    };
  }

  if (visit.checkedInAt) {
    const validUntil = addMinutes(visit.checkedInAt, visit.durationMinutes);
    return {
      validFrom: visit.checkedInAt,
      validUntil,
      isValid: now <= validUntil,
    };
  }

  return { validFrom: null, validUntil: null, isValid: false };
}

export const STATUS_LABELS: Record<VisitStatus, string> = {
  INVITED: "Invited",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  CHECKED_IN: "On Campus",
  CHECKED_OUT: "Checked Out",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  DENIED: "Denied",
};

export const STATUS_COLORS: Record<VisitStatus, string> = {
  INVITED: "bg-blue-100 text-blue-800",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  CHECKED_IN: "bg-emerald-100 text-emerald-800",
  CHECKED_OUT: "bg-slate-100 text-slate-700",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-600",
  DENIED: "bg-red-100 text-red-800",
};
