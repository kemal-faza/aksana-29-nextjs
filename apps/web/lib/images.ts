const SUPABASE_STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

export function getImageUrl(canonicalPath: string, size: 320 | 640 | 960 | 1080 = 1080) {
  return `${SUPABASE_STORAGE}/${canonicalPath.replace('/1080.webp', `/${size}.webp`)}`;
}

export function getImageSrcSet(canonicalPath: string) {
  return [320, 640, 960, 1080]
    .map(size => `${getImageUrl(canonicalPath, size as 320 | 640 | 960 | 1080)} ${size}w`)
    .join(', ');
}
