"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface GatePassProps {
  visitCode: string;
  visitorName: string;
  hostName: string;
  purpose: string;
  validUntil?: string | null;
}

export function GatePassCard({
  visitCode,
  visitorName,
  hostName,
  purpose,
  validUntil,
}: GatePassProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const url = `${window.location.origin}/pass/${visitCode}`;
    QRCode.toDataURL(url, { width: 200, margin: 2 }).then(setQrDataUrl);
  }, [visitCode]);

  return (
    <div className="mx-auto max-w-sm rounded-xl border-2 border-[#1e3a5f] bg-white p-6 shadow-lg print:shadow-none">
      <div className="mb-4 border-b border-[#c9a227] pb-3 text-center">
        <p className="text-xs uppercase tracking-widest text-[#c9a227]">
          IIM Lucknow
        </p>
        <h2 className="text-xl font-bold text-[#1e3a5f]">Visitor Gate Pass</h2>
        <p className="font-mono text-sm text-gray-600">{visitCode}</p>
      </div>

      {qrDataUrl && (
        <div className="mb-4 flex justify-center">
          <img src={qrDataUrl} alt={`QR code for ${visitCode}`} className="h-48 w-48" />
        </div>
      )}

      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-gray-500">Visitor</dt>
          <dd className="font-semibold">{visitorName}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Host</dt>
          <dd>{hostName}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Purpose</dt>
          <dd>{purpose}</dd>
        </div>
        {validUntil && (
          <div>
            <dt className="text-gray-500">Valid Until</dt>
            <dd>{new Date(validUntil).toLocaleString("en-IN")}</dd>
          </div>
        )}
      </dl>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-6 w-full rounded-lg bg-[#1e3a5f] py-2 text-white hover:bg-[#162d4a] print:hidden"
      >
        Print Gate Pass
      </button>
    </div>
  );
}
