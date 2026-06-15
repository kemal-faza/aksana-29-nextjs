import { POST as signUpload } from '../app/admin/images/sign-upload/route';
import { POST as processUpload } from '../app/admin/images/process/route';

// Track call details for assertions
let signedUrlPath = '';
const mockCreateSignedUploadUrl = jest.fn().mockImplementation((path: string) => {
  signedUrlPath = path;
  return {
    data: { signedUrl: `https://supabase.co/storage/v1/s3/signed-url/${path}`, path },
    error: null,
  };
});

let downloadedPath = '';
const mockDownload = jest.fn().mockImplementation((path: string) => {
  downloadedPath = path;
  return {
    data: new Blob(['fake-image-data'], { type: 'image/jpeg' }),
    error: null,
  };
});

const uploadedPaths: string[] = [];
const mockUpload = jest.fn().mockImplementation((path: string) => {
  uploadedPaths.push(path);
  return { data: { path }, error: null };
});

jest.mock('../app/utils/supabase', () => ({
  getSupabaseAdmin: () => ({
    storage: {
      from: () => ({
        createSignedUploadUrl: mockCreateSignedUploadUrl,
        download: mockDownload,
        upload: mockUpload,
      }),
    },
  }),
}));

jest.mock('../app/utils/image-processor', () => ({
  processImage: jest.fn().mockResolvedValue([
    { size: 320, buffer: Buffer.from('320'), width: 320, height: 240 },
    { size: 640, buffer: Buffer.from('640'), width: 640, height: 480 },
    { size: 960, buffer: Buffer.from('960'), width: 960, height: 720 },
    { size: 1080, buffer: Buffer.from('1080'), width: 1080, height: 810 },
  ]),
  IMAGE_SIZES: [320, 640, 960, 1080],
}));

beforeEach(() => {
  signedUrlPath = '';
  downloadedPath = '';
  uploadedPaths.length = 0;
  jest.clearAllMocks();
});

describe('POST /api/admin/images/sign-upload', () => {
  it('returns signed URL for valid request', async () => {
    const request = new Request('http://localhost:3001/api/admin/images/sign-upload', {
      method: 'POST',
      body: JSON.stringify({ fileName: 'test.jpg', contentType: 'image/jpeg' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await signUpload(request as any);
    const data = await response.json();

    expect(data.url).toContain('signed-url');
    expect(data.path).toBeDefined();
    expect(data.expiresIn).toBe(300);
    expect(response.status).toBe(200);
  });

  it('returns 400 for missing fileName', async () => {
    const request = new Request('http://localhost:3001/api/admin/images/sign-upload', {
      method: 'POST',
      body: JSON.stringify({ contentType: 'image/jpeg' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await signUpload(request as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('fileName');
  });

  it('returns 400 for missing contentType', async () => {
    const request = new Request('http://localhost:3001/api/admin/images/sign-upload', {
      method: 'POST',
      body: JSON.stringify({ fileName: 'test.jpg' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await signUpload(request as any);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('contentType');
  });

  it('generates unique storage path per call', async () => {
    const makeReq = () =>
      new Request('http://localhost:3001/api/admin/images/sign-upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: 'photo.png', contentType: 'image/png' }),
        headers: { 'Content-Type': 'application/json' },
      });

    const res1 = await signUpload(makeReq() as any);
    const data1 = await res1.json();

    const res2 = await signUpload(makeReq() as any);
    const data2 = await res2.json();

    expect(data1.path).not.toBe(data2.path);
  });
});

describe('POST /api/admin/images/process', () => {
  it('processes image and uploads 4 variants plus original', async () => {
    const request = new Request('http://localhost:3001/api/admin/images/process', {
      method: 'POST',
      body: JSON.stringify({
        storagePath: 'uploads/test-uuid.jpg',
        entity: 'students',
        entityId: '550e8400-e29b-41d4-a716-446655440000',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await processUpload(request as any);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.paths).toHaveLength(4);
    expect(data.canonical).toContain('/1080.webp');
    expect(response.status).toBe(200);
  });

  it('includes original upload in storage', async () => {
    const request = new Request('http://localhost:3001/api/admin/images/process', {
      method: 'POST',
      body: JSON.stringify({
        storagePath: 'uploads/test-uuid.jpg',
        entity: 'teachers',
        entityId: 'uuid-here',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    await processUpload(request as any);

    // 4 variants + 1 original = 5 uploads
    expect(mockUpload).toHaveBeenCalledTimes(5);
    const originalCall = mockUpload.mock.calls.find(
      (call: string[]) => call[0].includes('/original')
    );
    expect(originalCall).toBeDefined();
  });

  it('returns 400 for missing fields', async () => {
    const request = new Request('http://localhost:3001/api/admin/images/process', {
      method: 'POST',
      body: JSON.stringify({ storagePath: 'uploads/test.jpg' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await processUpload(request as any);
    expect(response.status).toBe(400);
  });
});
