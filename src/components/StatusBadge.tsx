"use client";

import { VisitStatus } from "@prisma/client";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/visits";

export function StatusBadge({ status }: { status: VisitStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
