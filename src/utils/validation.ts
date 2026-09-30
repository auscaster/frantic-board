import { Startup } from '../types/startup';

interface ValidationErrors {
  [key: string]: string;
}

export const validateStartup = (startup: Startup): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!startup.name) {
    errors.name = 'Name is required';
  }

  if (!startup.description) {
    errors.description = 'Description is required';
  }

  if (!startup.website) {
    errors.website = 'Website is required';
  } else if (!/^https?:\/\/.+/.test(startup.website)) {
    errors.website = 'Invalid URL format';
  }

  if (!startup.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(startup.email)) {
    errors.email = 'Invalid email format';
  }

  return errors;
};
