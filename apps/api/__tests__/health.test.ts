import { GET } from '../app/public/health/route';

describe('Health Endpoint', () => {
  it('should return 200 status with ok and timestamp', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      status: 'ok',
    });
    expect(body.timestamp).toBeDefined();
    expect(typeof body.timestamp).toBe('string');
    // Verify timestamp is ISO format
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });
});
