import Retell from 'retell-sdk';

// Hardcode your API key here instead of using .env
// (Replace this placeholder with your actual Retell API key)
const HARDCODED_API_KEY = "key_f14c7809bf1f28aab05378feb826";

export const retellClient = new Retell({
  apiKey: HARDCODED_API_KEY,
});
