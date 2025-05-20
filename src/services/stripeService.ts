import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function createCheckoutSession(priceId: string): Promise<string> {
  const url = `${API_URL}/api/create-checkout-session`;
  try {
    const response = await axios.post(url, { priceId });
    return response.data.url as string;
  } catch (err) {
    console.error('Failed to create checkout session', err);
    throw err;
  }
}
