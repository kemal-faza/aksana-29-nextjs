import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '../../../utils/supabase';
import { processImage } from '../../../utils/image-processor';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();

  const { storagePath, entity, entityId } = await request.json();

  if (!storagePath || !entity || !entityId) {
    return NextResponse.json(
      { error: 'storagePath, entity, and entityId required' },
      { status: 400 }
    );
  }

  // Download original from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('images')
    .download(storagePath);

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }

  // Process into WebP variants
  const buffer = Buffer.from(await fileData.arrayBuffer());
  const variants = await processImage(buffer);

  // Upload each variant
  const uploadedPaths: string[] = [];

  for (const variant of variants) {
    const variantPath = `images/${entity}/${entityId}/${variant.size}.webp`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(variantPath, variant.buffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
    uploadedPaths.push(variantPath);
  }

  // Also store original
  const originalPath = `images/${entity}/${entityId}/original`;
  await supabase.storage
    .from('images')
    .upload(originalPath, buffer, { contentType: fileData.type, upsert: true });

  return NextResponse.json({
    success: true,
    paths: uploadedPaths,
    canonical: `images/${entity}/${entityId}/1080.webp`,
  });
}
