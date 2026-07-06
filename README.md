# Reply Router Skill

A runx skill that routes incoming messages to appropriate reply handlers.

## Usage

Send a POST request to `/api/reply` with a JSON body containing a `text` field:

```json
{
  "text": "Hello, world!"
}
```

The server will respond with a JSON object containing the `reply` field.

## Adding new handlers

1. Create a new file in `src/handlers/` implementing the `Handler` interface.
2. Import and add an instance to the `handlers` array in `src/router.ts`.

## Development

- `npm install`
- `npm run build` (compile TypeScript)
- `npm start` (run the server)
```