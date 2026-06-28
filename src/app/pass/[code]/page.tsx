"use client";

import { useEffect, useState } from "react";
import { GatePassCard } from "@/components/GatePassCard";
import { StatusBadge } from "@/components/StatusBadge";
import { VisitStatus } from "@prisma/client";

export default function PassPage({ params }: { params: Promise<{ code: string }> }) {
  const [code, setCode] = useState("");
  const [visit, setVisit] = useState<{
    visitCode: string;
    visitorName: string;
    purpose: string;
    status: VisitStatus;
    validUntil: string | null;
    host: { name: string; department: string | null };
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ code: c }) => {
      setCode(c);
      fetch(`/api/pass/${c}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.visit) setVisit(d.visit);
          else setError(d.error ?? "Not found");
        });
    });
  }, [params]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading pass…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] py-12">
      <div className="mb-4 text-center">
        <StatusBadge status={visit.status} />
      </div>
      <GatePassCard
        visitCode={visit.visitCode}
        visitorName={visit.visitorName}
        hostName={visit.host.name}
        purpose={visit.purpose}
        validUntil={visit.validUntil}
      />
      <p className="mt-4 text-center text-xs text-gray-500">
        Pass ID: {code}
      </p>
    </div>
  );
}
