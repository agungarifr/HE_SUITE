import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import { runCrawler } from '../services/crawler.js';
import { getActiveBrainContext } from '../services/brain.js';
import { runHEEvaluation, parsePrompt } from '../services/ai.js';

const router = Router();
const REPORTS_PATH = path.join(process.cwd(), 'public', 'data', 'reports.json');

async function getReports() {
  try {
    const data = await fs.readFile(REPORTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveReports(reports) {
  await fs.mkdir(path.dirname(REPORTS_PATH), { recursive: true }).catch(() => {});
  await fs.writeFile(REPORTS_PATH, JSON.stringify(reports, null, 2), 'utf-8');
}

// List all reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await getReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a report
router.delete('/reports/:id', async (req, res) => {
  try {
    let reports = await getReports();
    reports = reports.filter(r => r.id !== req.params.id);
    await saveReports(reports);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export report to Excel (.xlsx)
router.get('/reports/:id/export/excel', async (req, res) => {
  try {
    const reports = await getReports();
    const report = reports.find(r => r.id === req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report tidak ditemukan.' });
    }

    const rows = (report.findings || []).map((f, idx) => ({
      'No': idx + 1,
      'Finding ID': f.ID || `HE-${idx + 1}`,
      'Type': f.Type || 'UX',
      'Severity (0-4)': f.Severity ?? 2,
      'Heuristic / Category': f.Heuristic_Type || '-',
      'Issue Title': f.Issue_Title || '',
      'Description': f.Description || '',
      'Recommendation': f.Recommendation || '',
      'Context / User Story': f.User_Story_Context || 'Global'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'HE Findings');

    // Summary metadata sheet
    const summaryData = [
      { Parameter: 'Report ID', Nilai: report.id },
      { Parameter: 'Target Website', Nilai: report.website },
      { Parameter: 'Tanggal Evaluasi', Nilai: report.createdAt },
      { Parameter: 'Total Temuan', Nilai: (report.findings || []).length },
      { Parameter: 'Critical Issues (Sev 3-4)', Nilai: (report.findings || []).filter(f => f.Severity >= 3).length }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Info Evaluasi');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="HE_Report_${report.id}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run Heuristic Evaluation with SSE Stream
router.post('/run', async (req, res) => {
  const { prompt, cookies } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt evaluasi tidak boleh kosong.' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  };

  try {
    const { url, cases } = parsePrompt(prompt);
    sendEvent('status', `Memulai evaluasi... Target URL terdeteksi: ${url || '(Tidak ada URL spesifik, menggunakan mode umum)'}`);
    if (cases.length > 0) {
      sendEvent('status', `Daftar use cases: ${cases.join(', ')}`);
    }

    let crawlerData = { url: url || 'N/A' };
    if (url) {
      sendEvent('status', 'Menjalankan automated web crawler & screenshot capture...');
      crawlerData = await runCrawler({
        url,
        cookies: Array.isArray(cookies) ? cookies : [],
        onProgress: (msg) => sendEvent('status', msg)
      });
    }

    sendEvent('status', 'Mengumpulkan memori aktif dari Second Brain...');
    const brainContext = await getActiveBrainContext();
    sendEvent('status', `Terserap ${brainContext.totalActiveNotes} catatan aktif & ${brainContext.totalVaultDocs} dokumen vault dari Second Brain. Memanggil model AI...`);

    const result = await runHEEvaluation({
      prompt,
      crawlerData,
      kbContext: brainContext,
      onChunk: (chunk) => sendEvent('chunk', chunk)
    });

    // Save report to persistent database
    const newReport = {
      id: 'REP-' + Date.now().toString().slice(-6),
      website: crawlerData.url || url || 'Manual Prompt Evaluation',
      createdAt: new Date().toISOString(),
      prompt,
      summary: result.summary,
      findings: result.findings
    };

    const reports = await getReports();
    reports.unshift(newReport);
    await saveReports(reports);

    sendEvent('done', {
      report: newReport,
      summary: result.summary,
      findings: result.findings
    });

    res.end();
  } catch (err) {
    console.error('Error in /api/he/run:', err);
    sendEvent('error', err.message || 'Terjadi kesalahan sistem saat evaluasi.');
    res.end();
  }
});

export default router;
