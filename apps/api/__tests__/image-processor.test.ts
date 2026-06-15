import { processImage, validateImage, IMAGE_SIZES } from '../app/utils/image-processor';

describe('Image Processor', () => {
  let testBuffer: Buffer;

  beforeAll(async () => {
    // Generate a simple 2000x1500 test JPEG using sharp
    const sharp = require('sharp');
    testBuffer = await sharp({
      create: {
        width: 2000,
        height: 1500,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();
  });

  describe('processImage', () => {
    it('generates all 4 variant sizes', async () => {
      const results = await processImage(testBuffer);
      expect(results).toHaveLength(4);
      expect(results.map((r) => r.size)).toEqual(expect.arrayContaining([320, 640, 960, 1080]));
    });

    it('each variant has a buffer', async () => {
      const results = await processImage(testBuffer);
      results.forEach((r) => {
        expect(r.buffer).toBeInstanceOf(Buffer);
        expect(r.buffer.length).toBeGreaterThan(0);
      });
    });

    it('smaller variants have smaller buffers', async () => {
      const results = await processImage(testBuffer);
      const sorted = results.sort((a, b) => a.size - b.size);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].buffer.length).toBeGreaterThan(sorted[i - 1].buffer.length);
      }
    });

    it('maintains aspect ratio', async () => {
      const results = await processImage(testBuffer);
      const expectedRatio = 2000 / 1500;
      results.forEach((r) => {
        const ratio = r.width / r.height;
        expect(Math.abs(ratio - expectedRatio)).toBeLessThan(0.01);
      });
    });

    it('does not enlarge images smaller than target', async () => {
      const sharp = require('sharp');
      const smallBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 0, g: 255, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      const results = await processImage(smallBuffer);
      results.forEach((r) => {
        expect(r.width).toBeLessThanOrEqual(100);
        expect(r.height).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('validateImage', () => {
    it('returns true for valid JPEG', async () => {
      const result = await validateImage(testBuffer);
      expect(result).toBe(true);
    });

    it('returns false for invalid data', async () => {
      const result = await validateImage(Buffer.from('not-an-image'));
      expect(result).toBe(false);
    });
  });
});
