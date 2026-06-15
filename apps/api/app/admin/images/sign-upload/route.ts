import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '../../../utils/supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();

  const { fileName, contentType } = await request.json();

  if (!fileName || !contentType) {
    return NextResponse.json({ error: 'fileName and contentType required' }, { status: 400 });
  }

  // Generate unique path
  const ext = fileName.split('.').pop();
  const uniqueId = crypto.randomUUID();
  const storagePath = `uploads/${uniqueId}.${ext}`;

  // Create signed upload URL (expires in 5 minutes)
  const { data, error } = await supabase.storage
    .from('images')
    .createSignedUploadUrl(storagePath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    url: data.signedUrl,
    path: storagePath,
    expiresIn: 300,
  });
}
