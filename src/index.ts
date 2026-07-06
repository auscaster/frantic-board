import express from 'express';
import { router } from './router';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/reply', router);

app.listen(PORT, () => {
  console.log(`Reply router skill running on port ${PORT}`);
});