// Pemeriksaan naskah berbasis aturan sederhana (BUKAN AI) — murni fungsi,
// tanpa panggilan DB/network, jadi aman dipanggil langsung di Server
// Component setiap kali halaman dirender (selalu up-to-date, tidak perlu
// disimpan). Semua hasil bersifat saran, tidak pernah memblokir apa pun.

export type ManuscriptSuggestion = {
  severity: "info" | "warning";
  message: string;
};

const REQUIRED_SECTION_KEYWORDS: Record<string, string[]> = {
  MONOGRAF: ["pendahuluan", "daftar pustaka"],
  REFERENSI: ["pendahuluan", "daftar pustaka"],
  HANDBOOK: ["daftar isi", "daftar pustaka"],
  TEKNOLOGI_TEPAT_GUNA: ["pendahuluan", "daftar pustaka"],
};

const LONG_SENTENCE_WORD_COUNT = 40;
const LONG_PARAGRAPH_WORD_COUNT = 250;

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractByTag(html: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    matches.push(stripTags(match[1]));
  }
  return matches;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function getManuscriptSuggestions(
  contentHtml: string,
  category: string,
): ManuscriptSuggestion[] {
  const suggestions: ManuscriptSuggestion[] = [];

  const headings = [
    ...extractByTag(contentHtml, "h1"),
    ...extractByTag(contentHtml, "h2"),
    ...extractByTag(contentHtml, "h3"),
  ];
  const paragraphs = extractByTag(contentHtml, "p").filter(Boolean);
  const plainText = stripTags(contentHtml);
  const totalWords = countWords(plainText);
  const sentences = splitSentences(plainText);

  if (headings.length === 0) {
    suggestions.push({
      severity: "warning",
      message:
        "Naskah belum punya struktur bab (heading). Tambahkan judul bab (mis. gaya \"Heading 1\" di Word, atau \"# Judul Bab\" di Markdown) agar naskah mudah dinavigasi dan bisa dipisah per bab saat di-layout.",
    });
  }

  const longSentenceCount = sentences.filter(
    (sentence) => countWords(sentence) > LONG_SENTENCE_WORD_COUNT,
  ).length;
  if (longSentenceCount > 0) {
    suggestions.push({
      severity: "warning",
      message: `Ada ${longSentenceCount} kalimat lebih dari ${LONG_SENTENCE_WORD_COUNT} kata. Pertimbangkan memecahnya jadi beberapa kalimat pendek agar lebih mudah dibaca.`,
    });
  }

  const longParagraphCount = paragraphs.filter(
    (paragraph) => countWords(paragraph) > LONG_PARAGRAPH_WORD_COUNT,
  ).length;
  if (longParagraphCount > 0) {
    suggestions.push({
      severity: "warning",
      message: `Ada ${longParagraphCount} paragraf lebih dari ${LONG_PARAGRAPH_WORD_COUNT} kata. Paragraf yang sangat panjang sering lebih sulit diikuti pembaca — pertimbangkan membaginya.`,
    });
  }

  const requiredKeywords = REQUIRED_SECTION_KEYWORDS[category] ?? [];
  const searchableText = (
    headings.length > 0 ? headings.join(" ") : plainText
  ).toLowerCase();
  for (const keyword of requiredKeywords) {
    if (!searchableText.includes(keyword)) {
      suggestions.push({
        severity: "warning",
        message: `Bagian "${keyword.replace(/\b\w/g, (c) => c.toUpperCase())}" sepertinya belum ada di naskah — bagian ini umumnya diharapkan untuk kategori buku ini.`,
      });
    }
  }

  if (sentences.length > 0) {
    const avgWordsPerSentence = totalWords / sentences.length;
    let readabilityLabel: string;
    if (avgWordsPerSentence < 15) {
      readabilityLabel = "cukup mudah dibaca (kalimat pendek-sedang)";
    } else if (avgWordsPerSentence < 25) {
      readabilityLabel = "sedang";
    } else {
      readabilityLabel =
        "kalimat rata-rata cukup panjang — coba dipersingkat untuk keterbacaan lebih baik";
    }
    suggestions.push({
      severity: "info",
      message: `Rata-rata ${avgWordsPerSentence.toFixed(1)} kata per kalimat — ${readabilityLabel}.`,
    });
  }

  suggestions.push({
    severity: "info",
    message: `Total naskah saat ini sekitar ${totalWords.toLocaleString("id-ID")} kata.`,
  });

  return suggestions;
}
