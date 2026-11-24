const PLACEHOLDER_PATTERNS = [
  /^your[_-]/i,
  /placeholder/i,
  /here$/i,
  /^sk-xxx/i,
  /^demo$/i,
  /^changeme$/i,
];

export function isPlaceholderKey(value: string | undefined | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function getGeminiApiKey(): string | undefined {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (isPlaceholderKey(key)) return undefined;
  return key!.trim();
}

export interface ServerConfigStatus {
  geminiConfigured: boolean;
  yahooFinanceEnabled: boolean;
  mode: 'live' | 'hybrid-fallback';
  message: string;
}

export function getServerConfigStatus(): ServerConfigStatus {
  const geminiConfigured = Boolean(getGeminiApiKey());
  return {
    geminiConfigured,
    yahooFinanceEnabled: true,
    mode: geminiConfigured ? 'live' : 'hybrid-fallback',
    message: geminiConfigured
      ? 'Google Gemini AI & Yahoo Finance live market feeds are active.'
      : 'GOOGLE_GENERATIVE_AI_API_KEY is using a placeholder in .env.local. Live Yahoo Finance market quotes remain active; AI RAG & document extraction are running in safe demo fallback mode.',
  };
}
