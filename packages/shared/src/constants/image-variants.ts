export const IMAGE_VARIANTS = [320, 640, 960, 1080] as const;

export type ImageVariant = (typeof IMAGE_VARIANTS)[number];

export const CANONICAL_VARIANT: ImageVariant = 1080;
