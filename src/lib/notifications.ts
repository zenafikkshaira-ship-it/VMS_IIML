import { prisma } from "./db";

type NotifyChannel = "sms" | "whatsapp" | "email";

interface NotifyParams {
  visitId: string;
  channel: NotifyChannel;
  recipient: string;
  message: string;
}

export async function sendNotification(params: NotifyParams): Promise<void> {
  const provider =
    params.channel === "sms"
      ? process.env.SMS_PROVIDER
      : params.channel === "whatsapp"
        ? process.env.WHATSAPP_PROVIDER
        : process.env.EMAIL_PROVIDER;

  if (provider === "mock" || !provider) {
    console.log(`[NOTIFY:${params.channel}] To: ${params.recipient}`);
    console.log(`[NOTIFY:${params.channel}] ${params.message}`);
  }

  await prisma.notificationLog.create({
    data: {
      visitId: params.visitId,
      channel: params.channel,
      recipient: params.recipient,
      message: params.message,
      status: "sent",
    },
  });
}

export async function notifyHostOfArrival(visit: {
  id: string;
  visitorName: string;
  purpose: string;
  visitCode: string;
  host: { name: string; phone: string | null; email: string };
}) {
  const message = `Visitor ${visit.visitorName} has arrived at Main Gate for: ${visit.purpose}. Visit code: ${visit.visitCode}. Please approve in VMS portal.`;

  if (visit.host.phone) {
    await sendNotification({
      visitId: visit.id,
      channel: "sms",
      recipient: visit.host.phone,
      message,
    });
    await sendNotification({
      visitId: visit.id,
      channel: "whatsapp",
      recipient: visit.host.phone,
      message,
    });
  }

  await sendNotification({
    visitId: visit.id,
    channel: "email",
    recipient: visit.host.email,
    message,
  });
}

export async function notifyVisitorInvite(visit: {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string | null;
  visitCode: string;
  expectedAt: Date;
  host: { name: string; department: string | null };
}) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const message = `You are invited to IIM Lucknow by ${visit.host.name} (${visit.host.department ?? "IIML"}). Visit code: ${visit.visitCode}. Expected: ${visit.expectedAt.toLocaleString("en-IN")}. Show QR at gate: ${appUrl}/pass/${visit.visitCode}`;

  await sendNotification({
    visitId: visit.id,
    channel: "sms",
    recipient: visit.visitorPhone,
    message,
  });

  if (visit.visitorEmail) {
    await sendNotification({
      visitId: visit.id,
      channel: "email",
      recipient: visit.visitorEmail,
      message,
    });
  }
}
