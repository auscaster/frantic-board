import { Router, Request, Response } from 'express';
import { Handler } from './handlers/Handler';
import { ExampleHandler } from './handlers/example';

export const router = Router();

const handlers: Handler[] = [
  new ExampleHandler()
];

router.post('/', (req: Request, res: Response) => {
  const message = req.body;
  if (!message || !message.text) {
    return res.status(400).json({ error: 'Missing message text' });
  }

  for (const handler of handlers) {
    if (handler.canHandle(message)) {
      const reply = handler.handle(message);
      return res.json({ reply });
    }
  }

  // Default reply if no handler matches
  res.json({ reply: 'I did not understand your message.' });
});