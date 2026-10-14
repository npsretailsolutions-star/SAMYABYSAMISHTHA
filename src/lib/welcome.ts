import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { WELCOME_COOKIE } from "@/lib/constants";

// True when this visitor shared their email through the welcome popup. The cookie
// holds the email; we confirm it exists in the Subscriber table so it can't be faked.
export async function isWelcomeEligible(): Promise<boolean> {
  const email = cookies().get(WELCOME_COOKIE)?.value;
  if (!email) return false;
  const sub = await prisma.subscriber.findUnique({ where: { email: decodeURIComponent(email) } });
  return !!sub;
}
