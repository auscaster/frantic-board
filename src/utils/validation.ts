export function validateStartup(startup: Partial<Startup>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!startup.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!startup.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!startup.website?.trim()) {
    errors.website = 'Website is required';
  } else if (!isValidUrl(startup.website)) {
    errors.website = 'Invalid website URL';
  }

  if (!startup.foundedYear) {
    errors.foundedYear = 'Founded year is required';
  } else if (typeof startup.foundedYear !== 'number' || isNaN(startup.foundedYear)) {
    errors.foundedYear = 'Invalid year';
  }

  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
}