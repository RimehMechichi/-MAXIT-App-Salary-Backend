import dotenv from 'dotenv';
dotenv.config();

export default {
  apiKey: process.env.SERPAPI_API_KEY,
  baseUrl: process.env.SERPAPI_API_BASE_URL,
};
