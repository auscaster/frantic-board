import { createStartup } from '../../src/services/api';

describe('createStartup', () => {
  it('creates a new startup successfully', async () => {
    const mockResponse = { id: '1', name: 'Test Startup' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: mockResponse }),
    });

    const startup = {
      name: 'Test Startup',
      description: 'Test Description',
      website: 'https://test.com',
      email: 'test@example.com',
    };

    const result = await createStartup(startup);

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/startups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(startup),
    });
  });

  it('throws an error when the request fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    const startup = {
      name: 'Test Startup',
      description: 'Test Description',
      website: 'https://test.com',
      email: 'test@example.com',
    };

    await expect(createStartup(startup)).rejects.toThrow('Failed to create startup');
  });
});
