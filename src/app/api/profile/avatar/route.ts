import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  // 1. Verify the caller is logged in
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // 2. Parse the multipart form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // 3. Validate file type and size (max 5 MB)
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 400 });
  }

  // 4. Upload using the admin client (bypasses storage RLS entirely)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `${user.id}/avatar.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await adminClient.storage
    .from("photos")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // 5. Get the public URL
  const { data: urlData } = adminClient.storage
    .from("photos")
    .getPublicUrl(storagePath);

  const avatarUrl = urlData.publicUrl;

  // 6. Persist avatar_url to profiles using the admin client
  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: `Profile update failed: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ avatarUrl });
}
