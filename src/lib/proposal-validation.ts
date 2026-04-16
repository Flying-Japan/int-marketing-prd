import type {
  ExecutionItem,
  ProposalDraft,
  QuoteItem,
  SlideData,
} from "@/types/proposal";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isExecutionItem(value: unknown): value is ExecutionItem {
  return (
    isObject(value) &&
    isString(value.id) &&
    isString(value.category) &&
    isString(value.title) &&
    isString(value.description) &&
    typeof value.enabled === "boolean"
  );
}

function isQuoteItem(value: unknown): value is QuoteItem {
  return (
    isObject(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.unit) &&
    isNumber(value.quantity) &&
    isNumber(value.unitPrice) &&
    isString(value.note)
  );
}

function isSlideData(value: unknown): value is SlideData {
  const allowedTypes = new Set([
    "cover",
    "toc",
    "section",
    "content",
    "chart",
    "timeline",
    "closing",
  ]);

  return (
    isObject(value) &&
    isString(value.id) &&
    isNumber(value.order) &&
    isString(value.type) &&
    allowedTypes.has(value.type) &&
    isString(value.title) &&
    (value.subtitle === undefined || isString(value.subtitle)) &&
    (value.body === undefined || isString(value.body)) &&
    (value.bullets === undefined || isStringArray(value.bullets)) &&
    (value.note === undefined || isString(value.note))
  );
}

export function validateProposalDraft(
  value: unknown,
): { ok: true; value: ProposalDraft } | { ok: false; error: string } {
  if (!isObject(value)) {
    return { ok: false, error: "AI response must be a JSON object." };
  }

  if (!isString(value.theme)) {
    return { ok: false, error: "Missing or invalid theme." };
  }

  if (!Array.isArray(value.executionItems) || !value.executionItems.every(isExecutionItem)) {
    return {
      ok: false,
      error: "executionItems must be an array of valid execution items.",
    };
  }

  if (!Array.isArray(value.quoteItems) || !value.quoteItems.every(isQuoteItem)) {
    return {
      ok: false,
      error: "quoteItems must be an array of valid quote items.",
    };
  }

  if (!isString(value.budget)) {
    return { ok: false, error: "Missing or invalid budget." };
  }

  if (!isString(value.schedule)) {
    return { ok: false, error: "Missing or invalid schedule." };
  }

  if (!Array.isArray(value.slides) || !value.slides.every(isSlideData)) {
    return {
      ok: false,
      error: "slides must be an array of valid slide objects.",
    };
  }

  return {
    ok: true,
    value: value as unknown as ProposalDraft,
  };
}
