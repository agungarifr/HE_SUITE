import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const envPath = path.join(process.cwd(), '.env');

export async function getConfig() {
  const apiKey = process.env.OPENAI_API_KEY || '';
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  return {
    baseUrl,
    model,
    hasKey: Boolean(apiKey),
    apiKeyMasked: apiKey ? `***${apiKey.slice(-4)}` : ''
  };
}

export async function saveConfig({ apiKey, baseUrl, model }) {
  let envContent = '';
  try {
    envContent = await fs.readFile(envPath, 'utf-8');
  } catch {
    envContent = '';
  }

  const envMap = {};
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      envMap[k] = v;
    }
  }

  if (apiKey !== undefined && apiKey !== '') {
    envMap.OPENAI_API_KEY = apiKey;
    process.env.OPENAI_API_KEY = apiKey;
  }
  if (baseUrl !== undefined) {
    envMap.OPENAI_BASE_URL = baseUrl;
    process.env.OPENAI_BASE_URL = baseUrl;
  }
  if (model !== undefined) {
    envMap.OPENAI_MODEL = model;
    process.env.OPENAI_MODEL = model;
  }

  const lines = Object.entries(envMap).map(([k, v]) => `${k}=${v}`);
  try {
    await fs.writeFile(envPath, lines.join('\n') + '\n', 'utf-8');
  } catch (err) {
    console.warn(`[Config Warning] Tidak dapat menulis ke .env (${err.message}). Konfigurasi tetap aktif di memori sesi.`);
  }
  return getConfig();
}

export async function testConnection({ apiKey, baseUrl, model }) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  const url = baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const mod = model || process.env.OPENAI_MODEL || 'gpt-4o';

  if (!key) {
    throw new Error('API Key belum diisi.');
  }

  const client = new OpenAI({
    apiKey: key,
    baseURL: url
  });

  // Test prompt with 1 max token for quick verification
  const res = await client.chat.completions.create({
    model: mod,
    messages: [{ role: 'user', content: 'ping' }],
    max_tokens: 2
  });

  return {
    success: true,
    message: 'Koneksi berhasil ke model: ' + mod,
    response: res.choices?.[0]?.message?.content || 'OK'
  };
}
