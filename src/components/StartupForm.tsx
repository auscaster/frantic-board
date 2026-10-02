import { useState, useCallback } from 'react';
import { validateStartup } from '../utils/validation';

export function StartupForm({
  onSubmitSuccess,
  onSubmitError,
  apiConfig,
}: {
  onSubmitSuccess: () => void;
  onSubmitError: (errors: Record<string, string>) => void;
  apiConfig: { baseUrl: string };
}) {
  const [formData, setFormData] = useState<Partial<Startup>>({
    name: '',
    description: '',
    website: '',
    foundedYear: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedErrors = validateStartup(formData);
      if (Object.keys(validatedErrors).length > 0) {
        throw new Error('Validation failed');
      }

      const startup: Startup = {
        name: formData.name?.trim() as string,
        description: formData.description?.trim() as string,
        website: formData.website?.trim() as string,
        foundedYear: parseInt(formData.foundedYear as string),
      };

      await createStartup(startup, apiConfig.baseUrl);
      onSubmitSuccess();
      setFormSubmitted(true);
    } catch (error) {
      onSubmitError(error instanceof Error ? { general: error.message } : {});
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, apiConfig.baseUrl, onSubmitSuccess, onSubmitError]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors as user corrects input
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Website</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.website && <p className="text-red-500 text-sm">{errors.website}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Founded Year</label>
        <input
          type="number"
          name="foundedYear"
          value={formData.foundedYear}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.foundedYear && (
          <p className="text-red-500 text-sm">{errors.foundedYear}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Creating...' : 'Create Startup'}
      </button>

      {formSubmitted && (
        <p className="text-green-500 text-center mt-4">Startup created successfully!</p>
      )}
    </form>
  );
}