import OpenAI from 'openai';
import { getConfig } from './config.js';

// Helper to extract URL and cases from prompt if not explicitly structured
export function parsePrompt(promptText) {
  let url = '';
  const urlMatch = promptText.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+(?:\/[^\s,]+)?)/i);
  if (urlMatch) {
    url = urlMatch[0];
  }

  let cases = [];
  const caseMatch = promptText.match(/(?:case|kasus|fitur|skenario|scenario)s?\s*:\s*([^.\n]+)/i);
  if (caseMatch) {
    cases = caseMatch[1].split(/[,;\n]/).map(c => c.trim()).filter(Boolean);
  }

  return { url, cases };
}

export async function runHEEvaluation({ prompt, crawlerData, kbContext, onChunk = () => {} }) {
  const config = await getConfig();
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('API Key belum dikonfigurasi. Silakan isi API Key di menu Pengaturan Model.');
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: config.baseUrl
  });

  let kbSummary = '';
  if (kbContext && (kbContext.activeNotes || kbContext.vaultDocs)) {
    const notesStr = (kbContext.activeNotes || [])
      .map(n => `### [SECOND BRAIN NOTE] ${n.title} (Tags: ${(n.tags || []).join(', ')})\n${n.content.slice(0, 3500)}`)
      .join('\n\n');
    const vaultStr = Object.entries(kbContext.vaultDocs || {})
      .map(([file, content]) => `### [SECOND BRAIN VAULT] ${file}\n${typeof content === 'string' ? content.slice(0, 3500) : JSON.stringify(content)}`)
      .join('\n\n');
    kbSummary = [notesStr, vaultStr].filter(Boolean).join('\n\n');
  } else {
    kbSummary = Object.entries(kbContext || {})
      .map(([file, content]) => `### ATURAN / GUIDELINE DARI: ${file}\n${typeof content === 'string' ? content.slice(0, 3500) : JSON.stringify(content)}`)
      .join('\n\n');
  }

  const systemPrompt = `Anda adalah Lead UI/UX Evaluator & QA Specialist profesional yang melakukan Heuristic Evaluation (HE) mendalam berdasarkan 10 Heuristik Nielsen, Prinsip WCAG, dan Knowledge Base terlampir.

KNOWLEDGE BASE & GUIDELINES:
${kbSummary || 'Gunakan standar industri Nielsen Norman Group 10 Usability Heuristics & WCAG 2.1.'}

TUGAS ANDA:
1. Analisis website dan use cases yang diminta user.
2. Identifikasi masalah UX (UX Issue) dan bug fungsional (Functional Bug) berdasarkan DOM, error console/network, dan best practice.
3. Berikan penjelasan naratif yang mendalam, lalu SELALU sertakan blok JSON valid di akhir dengan tag \`\`\`json berisi array findings.

FORMAT BLOK JSON DI AKHIR:
\`\`\`json
{
  "summary": "Ringkasan temuan evaluasi",
  "findings": [
    {
      "ID": "HE-01",
      "Type": "UX",
      "Severity": 3,
      "Heuristic_Type": "Visibility of System Status",
      "Issue_Title": "Judul masalah",
      "Description": "Penjelasan detail masalah dan lokasinya",
      "Recommendation": "Saran solusi spesifik",
      "User_Story_Context": "Login / Global"
    }
  ]
}
\`\`\`
Skala Severity:
0 = Bukan masalah / Saran kosmetik
1 = Masalah kosmetik (tidak mengganggu alur)
2 = Masalah minor (prioritas rendah)
3 = Masalah mayor (prioritas tinggi)
4 = Masalah katastropik (blocker / crash / data loss)`;

  const userContent = [
    {
      type: 'text',
      text: `Permintaan Evaluasi: ${prompt}

DATA CRAWLER TERBARU:
- URL: ${crawlerData.url}
- Console Errors: ${JSON.stringify(crawlerData.consoleErrors || [])}
- Network Failures: ${JSON.stringify(crawlerData.networkErrors || [])}
- Ringkasan Tombol: ${(crawlerData.interactiveElements?.buttons || []).slice(0, 25).map(b => b.text || b.id).filter(Boolean).join(', ')}
- Ringkasan Input: ${(crawlerData.interactiveElements?.inputs || []).slice(0, 25).map(i => `${i.type || 'text'}:${i.name || i.id || i.placeholder}`).filter(Boolean).join(', ')}

Lakukan evaluasi menyeluruh untuk use cases yang diminta user!`
    }
  ];

  // If model supports vision and we have screenshot base64
  if (crawlerData.screenshotBase64 && config.model.includes('4o')) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:image/png;base64,${crawlerData.screenshotBase64}`
      }
    });
  }

  const stream = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    stream: true
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content || '';
    if (delta) {
      fullResponse += delta;
      onChunk(delta);
    }
  }

  // Parse structured findings from response
  let structuredData = { summary: '', findings: [] };
  try {
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      structuredData = JSON.parse(jsonMatch[1]);
    }
  } catch (err) {
    console.warn('Gagal mem-parse JSON findings dari response AI:', err.message);
  }

  return {
    rawText: fullResponse,
    summary: structuredData.summary || 'Evaluasi Heuristik Selesai',
    findings: Array.isArray(structuredData.findings) ? structuredData.findings : []
  };
}
