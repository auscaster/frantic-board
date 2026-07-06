export interface Handler {
  canHandle(message: { text: string; [key: string]: any }): boolean;
  handle(message: { text: string; [key: string]: any }): string;
}