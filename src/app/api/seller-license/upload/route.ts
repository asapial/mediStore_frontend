/**
 * POST /api/seller-license/upload
 *
 * Proxies the multipart file upload to the Express backend.
 *
 * WHY a Route Handler instead of next.config.ts rewrites?
 * ─────────────────────────────────────────────────────────
 * Next.js rewrites buffer + re-encode the multipart body, corrupting the
 * boundary string so Multer on the Express side sees an empty req.file.
 *
 * WHY formData() + Blob instead of raw req.body stream?
 * ──────────────────────────────────────────────────────
 * Piping req.body as a raw stream works in some Node.js versions but silently
 * drops bytes or corrupts binary data in others (especially in Next.js dev mode
 * with the body-size interceptor active).  Reading the file into a Buffer via
 * formData() and re-constructing a proper FormData + Blob is the only approach
 * that is 100% reliable across all environments.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime  = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.backendBaseUrl;
    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // ── 1. Parse the incoming multipart body ────────────────────────────────
    let incomingForm: FormData;
    try {
      incomingForm = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, message: "Failed to parse multipart form data" },
        { status: 400 }
      );
    }

    const fileEntry = incomingForm.get("file");
    if (!fileEntry || !(fileEntry instanceof Blob)) {
      return NextResponse.json(
        { success: false, message: "No file field found in the request" },
        { status: 400 }
      );
    }

    // ── 2. Read file bytes into an ArrayBuffer ───────────────────────────────
    // This guarantees we have the complete binary payload before forwarding.
    const fileBlob      = fileEntry as File;
    const arrayBuffer   = await fileBlob.arrayBuffer();
    const reconstructed = new Blob([arrayBuffer], { type: fileBlob.type });

    // ── 3. Rebuild FormData for the backend ─────────────────────────────────
    const outgoing = new FormData();
    outgoing.append("file", reconstructed, fileBlob.name ?? "upload");

    // ── 4. Forward to Express backend with auth cookie ───────────────────────
    const cookie = req.headers.get("cookie") ?? "";

    const backendRes = await fetch(
      `${backendUrl}/api/seller-license/upload`,
      {
        method:  "POST",
        headers: { cookie },   // let fetch set Content-Type + boundary automatically
        body:    outgoing,
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

  } catch (err: any) {
    console.error("[/api/seller-license/upload] proxy error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Upload proxy failed" },
      { status: 500 }
    );
  }
}
