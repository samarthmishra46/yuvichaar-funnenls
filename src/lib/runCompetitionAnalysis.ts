import Anthropic from '@anthropic-ai/sdk';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import dbConnect from '@/lib/mongodb';
import CompetitionAnalysis from '@/models/CompetitionAnalysis';
import ResearchEntry from '@/models/ResearchEntry';
import Organization from '@/models/Organization';

/* ── Claude web-search analysis ─────────────────────────────────────────── */

async function generateAnalysisText(orgName: string, website?: string, industry?: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const context = [
    `Organization: ${orgName}`,
    website ? `Website: ${website}` : null,
    industry ? `Industry: ${industry}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `${context}

You are a senior competitive market analyst. Using web search, research and write a comprehensive Competition Analysis Report for the organization above.

Structure the report with these exact sections:

# Executive Summary
A brief overview of the competitive landscape.

# Market Overview
Current market size, trends, and dynamics.

# Top Competitors
For each competitor (research at least 5-8), include:
- Company name and description
- Target audience
- Key products/services
- Pricing strategy
- Strengths
- Weaknesses

# Competitive Positioning
How ${orgName} compares against competitors across key dimensions.

# SWOT Analysis
Strengths, Weaknesses, Opportunities, Threats for ${orgName}.

# Strategic Opportunities
Gaps in the market that ${orgName} can exploit.

# Recommendations
Specific, actionable steps ${orgName} should take to outcompete the market.

Search the internet for up-to-date information. Be specific, data-driven, and thorough.`;

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }];
  let finalText = '';

  // Agentic loop — handles web_search tool_use turns
  for (let i = 0; i < 15; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
      messages,
    });

    // Collect any text in this turn
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === 'text'
    );
    if (textBlocks.length) finalText = textBlocks.map((b) => b.text).join('\n');

    if (response.stop_reason === 'end_turn') break;

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      messages.push({
        role: 'user',
        content: toolUses.map((tu) => ({
          type: 'tool_result' as const,
          tool_use_id: tu.id,
          content: '',
        })),
      });
    }
  }

  if (!finalText) throw new Error('Claude did not return any analysis text');
  return finalText;
}

/* ── PDF generation ─────────────────────────────────────────────────────── */

// pdf-lib standard fonts use WinAnsi (CP1252) — strip anything outside that range
function sanitize(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const cp = ch.codePointAt(0) ?? 0;
      if (cp < 0x20) return ' ';
      if (cp <= 0xff) return ch;
      // Common smart-quote / dash replacements
      if (cp === 0x2018 || cp === 0x2019) return "'";
      if (cp === 0x201c || cp === 0x201d) return '"';
      if (cp === 0x2013) return '-';
      if (cp === 0x2014) return '--';
      if (cp === 0x2022) return '-';  // bullet
      if (cp === 0x2026) return '...';
      return ''; // drop emoji, CJK, etc.
    })
    .join('')
    .replace(/  +/g, ' ')
    .trim();
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word.length > maxChars ? word.slice(0, maxChars) : word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function buildPdf(orgNameRaw: string, analysisText: string): Promise<Buffer> {
  const orgName = sanitize(orgNameRaw);
  const doc = await PDFDocument.create();
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 56;
  const TEXT_W = PAGE_W - MARGIN * 2;
  const CHARS_PER_LINE = 88;

  const pink = rgb(0.91, 0.12, 0.55);
  const dark = rgb(0.06, 0.09, 0.16);
  const mid = rgb(0.28, 0.34, 0.44);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) newPage();
  };

  // ── Cover ──
  page.drawRectangle({ x: 0, y: PAGE_H - 140, width: PAGE_W, height: 140, color: pink });
  page.drawText('Competition Analysis Report', {
    x: MARGIN,
    y: PAGE_H - 60,
    size: 22,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  page.drawText(orgName, {
    x: MARGIN,
    y: PAGE_H - 92,
    size: 14,
    font: regularFont,
    color: rgb(1, 1, 1),
  });
  page.drawText(`Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · Powered by Claude AI`, {
    x: MARGIN,
    y: PAGE_H - 118,
    size: 9,
    font: regularFont,
    color: rgb(1, 0.8, 0.93),
  });

  y = PAGE_H - 160;

  // ── Parse and render sections ──
  const rawLines = analysisText.split('\n');

  for (const raw of rawLines) {
    const line = sanitize(raw.trimEnd());

    if (line.startsWith('# ')) {
      // Major heading
      ensureSpace(40);
      y -= 18;
      page.drawText(line.slice(2), { x: MARGIN, y, size: 16, font: boldFont, color: pink });
      y -= 4;
      page.drawLine({ start: { x: MARGIN, y: y - 2 }, end: { x: PAGE_W - MARGIN, y: y - 2 }, thickness: 1, color: pink, opacity: 0.3 });
      y -= 14;
    } else if (line.startsWith('## ')) {
      ensureSpace(28);
      y -= 12;
      page.drawText(line.slice(3), { x: MARGIN, y, size: 13, font: boldFont, color: dark });
      y -= 12;
    } else if (line.startsWith('### ')) {
      ensureSpace(22);
      y -= 8;
      page.drawText(line.slice(4), { x: MARGIN + 8, y, size: 11, font: boldFont, color: mid });
      y -= 10;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletText = line.slice(2);
      const wrapped = wrapText(bulletText, CHARS_PER_LINE - 4);
      for (let i = 0; i < wrapped.length; i++) {
        ensureSpace(14);
        const prefix = i === 0 ? '•  ' : '   ';
        page.drawText(prefix + wrapped[i], { x: MARGIN + 12, y, size: 10, font: regularFont, color: dark });
        y -= 14;
      }
    } else if (/^\d+\.\s/.test(line)) {
      const wrapped = wrapText(line, CHARS_PER_LINE - 4);
      for (let i = 0; i < wrapped.length; i++) {
        ensureSpace(14);
        page.drawText(i === 0 ? wrapped[i] : '   ' + wrapped[i], { x: MARGIN + 8, y, size: 10, font: i === 0 ? boldFont : regularFont, color: dark });
        y -= 14;
      }
    } else if (line === '') {
      y -= 6;
    } else {
      // Body paragraph
      const wrapped = wrapText(line, CHARS_PER_LINE);
      for (const wl of wrapped) {
        ensureSpace(14);
        page.drawText(wl, { x: MARGIN, y, size: 10, font: regularFont, color: dark });
        y -= 14;
      }
    }
  }

  // Page numbers
  const pages = doc.getPages();
  pages.forEach((p, idx) => {
    p.drawText(`${idx + 1} / ${pages.length}`, {
      x: PAGE_W / 2 - 18,
      y: MARGIN / 2,
      size: 8,
      font: regularFont,
      color: mid,
    });
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

/* ── Bunny Storage upload ────────────────────────────────────────────────── */

async function uploadPdfToBunny(buffer: Buffer, orgName: string): Promise<string> {
  const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY!;
  const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
  const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com';
  const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL!;

  const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const fileName = `competition-analysis-${slug}-${Date.now()}.pdf`;
  const filePath = `yuvichaar/research/${fileName}`;
  const uploadUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${filePath}`;

  const MAX_RETRIES = 4;
  const TIMEOUT_MS = 90_000; // 90 s — PDFs can be large
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { AccessKey: BUNNY_STORAGE_API_KEY, 'Content-Type': 'application/octet-stream' },
        body: new Uint8Array(buffer),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) return `${BUNNY_CDN_URL}/${filePath}`;
      lastError = new Error(`Bunny upload failed (HTTP ${res.status}): ${await res.text()}`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      console.error(`[uploadPdfToBunny] attempt ${attempt}/${MAX_RETRIES} failed:`, err);
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 2000 * attempt)); // 2s, 4s, 6s back-off
    }
  }

  throw lastError;
}

/* ── Main orchestrator (runs in background) ─────────────────────────────── */

export async function runCompetitionAnalysis(orgId: string, jobId: string): Promise<void> {
  try {
    await dbConnect();

    // Fetch org details for richer Claude context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const org = (await Organization.findById(orgId).lean()) as any;
    const orgName: string = org?.name || 'Unknown Organization';
    const website: string | undefined = org?.website;
    const industry: string | undefined = org?.industry;

    // 1. Ask Claude to research
    const analysisText = await generateAnalysisText(orgName, website, industry);

    // 2. Build PDF
    const pdfBuffer = await buildPdf(orgName, analysisText);

    // 3. Upload to Bunny
    const pdfUrl = await uploadPdfToBunny(pdfBuffer, orgName);

    // 4. Create ResearchEntry so it appears in the research list automatically
    const entry = await ResearchEntry.create({
      orgId,
      title: `AI Competition Analysis — ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
      type: 'pdf',
      fileUrl: pdfUrl,
      description: 'AI-generated competition analysis (Claude + web search)',
      uploadedBy: 'ai-system',
    });

    // 5. Mark job complete
    await CompetitionAnalysis.findByIdAndUpdate(jobId, {
      status: 'completed',
      pdfUrl,
      researchEntryId: entry._id.toString(),
      completedAt: new Date(),
    });
  } catch (err) {
    console.error('[CompetitionAnalysis] Job failed:', err);
    await dbConnect();
    await CompetitionAnalysis.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
      completedAt: new Date(),
    });
  }
}
