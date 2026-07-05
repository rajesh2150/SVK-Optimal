export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay keys not configured' });
  }

  const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body;
  if (!amount || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({ amount, currency, receipt, payment_capture: 1 }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(500).json({ error: 'Razorpay order creation failed', detail: errorData });
    }

    const order = await response.json();
    return res.status(200).json({ ok: true, order, key_id: keyId });
  } catch (error) {
    return res.status(500).json({ error: 'Order creation failed', detail: error?.toString() });
  }
}
