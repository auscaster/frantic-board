import { Handler } from './Handler';

export class ExampleHandler implements Handler {
  canHandle(message: { text: string }): boolean {
    return message.text.toLowerCase().includes('hello');
  }

  handle(message: { text: string }): string {
    return `Hello! You said: "${message.text}"`;
  }
}