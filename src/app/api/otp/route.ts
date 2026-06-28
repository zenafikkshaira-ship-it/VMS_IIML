import { NextRequest, NextResponse } from "next/server";
import { createOtpSession, verifyOtp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, action } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    if (action === "send") {
      const otp = await createOtpSession(phone);
      console.log(`[OTP] To: ${phone} Code: ${otp}`);

      return NextResponse.json({
        success: true,
        message: "OTP sent",
        ...(process.env.NODE_ENV === "development" ? { debugOtp: otp } : {}),
      });
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "OTP code required" }, { status: 400 });
      }

      const valid = await verifyOtp(phone, code);
      if (!valid) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
      }

      return NextResponse.json({ success: true, verified: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "OTP operation failed" }, { status: 500 });
  }
}
