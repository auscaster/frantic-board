# runx skill: reply router

A simple reply router for runx skills. Allows registering handlers for specific patterns and routes incoming messages to the appropriate handler.

## Usage

```javascript
const ReplyRouter = require('./reply-router');
const router = new ReplyRouter();

router.addHandler('hello', (msg, ctx) => 'Hi there!');
router.addHandler(/^help/, (msg, ctx) => 'How can I help?');

const reply = await router.route('Hello world', { userId: 1 });
console.log(reply); // "Hi there!"
```

## License
MIT
