import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminSession } from "@/lib/auth";
import { getSupabaseAdmin, SUPABASE_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";

function slugifyBase(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Image storage is not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: `${file.name} is not an image` }, { status: 400 });
    }
  }

  // Convert and upload all files in parallel instead of one-by-one.
  try {
    const urls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Convert to WebP without resizing — pixel dimensions are preserved.
        const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();

        const base = slugifyBase(file.name) || "image";
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}.webp`;

        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(path, webpBuffer, {
            contentType: "image/webp",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`${file.name}: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
        return publicUrlData.publicUrl;
      })
    );
    return NextResponse.json({ urls });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
