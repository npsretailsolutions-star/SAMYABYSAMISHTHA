import { NextRequest, NextResponse } from "next/server";

/** Pincode → city (district) + state via India Post's public API. Used to autofill checkout. Cached for a week. */
export async function GET(_req: NextRequest, { params }: { params: { pin: string } }) {
  if (!/^[1-9][0-9]{5}$/.test(params.pin)) return NextResponse.json({ found: false }, { status: 400 });
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${params.pin}`, {
      next: { revalidate: 7 * 24 * 3600 },
      signal: AbortSignal.timeout(4000),
    });
    const data = (await res.json()) as {
      Status?: string;
      PostOffice?: { District?: string; State?: string }[] | null;
    }[];
    const po = data?.[0]?.Status === "Success" ? data[0].PostOffice?.[0] : null;
    if (!po?.District || !po?.State) return NextResponse.json({ found: false });
    return NextResponse.json(
      { found: true, city: po.District, state: po.State },
      { headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400" } }
    );
  } catch {
    return NextResponse.json({ found: false });
  }
}
