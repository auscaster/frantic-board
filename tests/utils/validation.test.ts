import { validateStartup } from '../../src/utils/validation';

describe('validateStartup', () => {
  it('returns no errors for valid startup', () => {
    const startup = {
      name: 'Test Startup',
      description: 'Test Description',
      website: 'https://test.com',
      email: 'test@example.com',
    };

    const errors = validateStartup(startup);

    expect(errors).toEqual({});
  });

  it('returns errors for empty fields', () => {
    const startup = {
      name: '',
      description: '',
      website: '',
      email: '',
    };

    const errors = validateStartup(startup);

    expect(errors).toEqual({
      name: 'Name is required',
      description: 'Description is required',
      website: 'Website is required',
      email: 'Email is required',
    });
  });

  it('returns errors for invalid inputs', () => {
    const startup = {
      name: 'Test Startup',
      description: 'Test Description',
      website: 'invalid-url',
      email: 'invalid-email',
    };

    const errors = validateStartup(startup);

    expect(errors).toEqual({
      website: 'Invalid URL format',
      email: 'Invalid email format',
    });
  });
});
