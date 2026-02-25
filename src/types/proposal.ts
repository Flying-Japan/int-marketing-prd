export interface MeetingInput {
  clientName: string;
  meetingMemo: string;
  storeFeatures: string;
  requirements: string;
}

export interface ExecutionItem {
  id: string;
  category: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface QuoteItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  note: string;
}

export interface ProposalDraft {
  theme: string;
  executionItems: ExecutionItem[];
  quoteItems: QuoteItem[];
  budget: string;
  schedule: string;
  slides: SlideData[];
}

export interface SlideData {
  id: string;
  order: number;
  type: "cover" | "toc" | "section" | "content" | "chart" | "timeline" | "closing";
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  note?: string;
}

export type ProposalStatus = "draft" | "review" | "confirmed" | "generated";

export interface Proposal {
  id: string;
  clientName: string;
  projectName: string;
  status: ProposalStatus;
  meeting: MeetingInput;
  draft: ProposalDraft | null;
  slidesUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalHistoryEntry {
  id: string;
  clientName: string;
  projectName: string;
  slideCount: number;
  createdAt: string;
  status: ProposalStatus;
}
