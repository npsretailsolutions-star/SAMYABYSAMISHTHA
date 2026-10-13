import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminSession } from "@/lib/auth";
import { getSupabaseAdmin, SUPABASE_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_WIDTH = 2400;

export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Image storage is not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please choose an image file" }, { status: 400 });
  }

  // Any size/ratio is accepted: normalise to a max width, keep the original aspect ratio,
  // and report the final dimensions so the storefront can render without cropping.
  const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer({ resolveWithObject: true });

  const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, data, { contentType: "image/webp", upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl, width: info.width, height: info.height });
}
