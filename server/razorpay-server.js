import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/create-order', async (req, res) => {
  if (!KEY_ID || !KEY_SECRET) return res.status(500).json({ error: 'Razorpay keys not configured' });
  const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;
  try {
    const resp = await axios.post('https://api.razorpay.com/v1/orders', { amount, currency, receipt, payment_capture: 1 }, {
      auth: { username: KEY_ID, password: KEY_SECRET },
    });
    return res.json({ ok: true, order: resp.data, key_id: KEY_ID });
  } catch (err) {
    return res.status(500).json({ error: 'Order creation failed', detail: err?.toString() });
  }
});

app.post('/api/verify-payment', (req, res) => {
  if (!KEY_SECRET) return res.status(500).json({ error: 'Razorpay keys not configured' });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ ok: false, error: 'Missing fields' });
  const generated = crypto.createHmac('sha256', KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (generated === razorpay_signature) return res.json({ ok: true });
  return res.status(400).json({ ok: false, error: 'Invalid signature' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Razorpay test server listening on http://localhost:${port}`));
