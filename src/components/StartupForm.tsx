import React, { useState } from 'react';
import { createStartup } from '../services/api';
import { Startup } from '../types/startup';
import { validateStartup } from '../utils/validation';

interface StartupFormProps {
  onSuccess: () => void;
}

const StartupForm: React.FC<StartupFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof Startup, string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startup: Startup = {
      name,
      description,
      website,
      email,
    };

    const validationErrors = validateStartup(startup);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createStartup(startup);
      onSuccess();
    } catch (error) {
      console.error('Failed to create startup:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <span>{errors.name}</span>}
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && <span>{errors.description}</span>}
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        {errors.website && <span>{errors.website}</span>}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span>{errors.email}</span>}
      </div>
      <button type="submit">Create Startup</button>
    </form>
  );
};

export default StartupForm;
