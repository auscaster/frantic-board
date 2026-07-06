import { z } from 'zod';

// Define a schema for the input
const InputSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0).max(150),
  email: z.string().email(),
});

type Input = z.infer<typeof InputSchema>;

/**
 * Schema guard that validates input against the defined schema.
 * Returns the validated data if valid, otherwise throws an error.
 */
export function schemaGuard(input: unknown): Input {
  const result = InputSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Schema validation failed: ${result.error.message}`);
  }
  return result.data;
}
