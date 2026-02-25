import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MeetingInput,
  Proposal,
  ProposalDraft,
  ProposalHistoryEntry,
} from "@/types/proposal";

interface ProposalState {
  currentStep: number;
  current: Proposal | null;
  history: ProposalHistoryEntry[];

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  startNew: (meeting: MeetingInput) => void;
  setDraft: (draft: ProposalDraft) => void;
  updateDraft: (patch: Partial<ProposalDraft>) => void;
  setSlidesUrl: (url: string) => void;
  setStatus: (status: Proposal["status"]) => void;

  loadFromHistory: (id: string) => void;
  saveToHistory: () => void;
  deleteFromHistory: (id: string) => void;

  reset: () => void;
}

function generateId(): string {
  const now = new Date();
  const ts = now
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 15);
  const rand = Math.random().toString(16).slice(2, 10);
  return `${ts}Z_${rand}`;
}

const STORAGE_KEY = "fj-proposals";

function loadFullProposals(): Proposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY + "-full");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFullProposals(proposals: Proposal[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY + "-full", JSON.stringify(proposals));
}

export const useProposalStore = create<ProposalState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      current: null,
      history: [],

      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((s) => ({ currentStep: Math.min(s.currentStep + 1, 3) })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      startNew: (meeting) => {
        const now = new Date().toISOString();
        set({
          currentStep: 0,
          current: {
            id: generateId(),
            clientName: meeting.clientName,
            projectName: "",
            status: "draft",
            meeting,
            draft: null,
            slidesUrl: null,
            createdAt: now,
            updatedAt: now,
          },
        });
      },

      setDraft: (draft) =>
        set((s) => {
          if (!s.current) return s;
          return {
            current: {
              ...s.current,
              draft,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      updateDraft: (patch) =>
        set((s) => {
          if (!s.current?.draft) return s;
          return {
            current: {
              ...s.current,
              draft: { ...s.current.draft, ...patch },
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setSlidesUrl: (url) =>
        set((s) => {
          if (!s.current) return s;
          return {
            current: {
              ...s.current,
              slidesUrl: url,
              status: "generated",
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setStatus: (status) =>
        set((s) => {
          if (!s.current) return s;
          return {
            current: {
              ...s.current,
              status,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      saveToHistory: () => {
        const { current } = get();
        if (!current) return;

        const all = loadFullProposals();
        const idx = all.findIndex((p) => p.id === current.id);
        if (idx >= 0) {
          all[idx] = current;
        } else {
          all.unshift(current);
        }
        saveFullProposals(all);

        const entry: ProposalHistoryEntry = {
          id: current.id,
          clientName: current.clientName,
          projectName: current.projectName || current.draft?.theme || "",
          slideCount: current.draft?.slides?.length ?? 0,
          createdAt: current.createdAt,
          status: current.status,
        };

        set((s) => {
          const hist = s.history.filter((h) => h.id !== entry.id);
          return { history: [entry, ...hist] };
        });
      },

      loadFromHistory: (id) => {
        const all = loadFullProposals();
        const found = all.find((p) => p.id === id);
        if (found) {
          set({ current: found, currentStep: 3 });
        }
      },

      deleteFromHistory: (id) => {
        const all = loadFullProposals().filter((p) => p.id !== id);
        saveFullProposals(all);
        set((s) => ({
          history: s.history.filter((h) => h.id !== id),
          current: s.current?.id === id ? null : s.current,
        }));
      },

      reset: () => set({ currentStep: 0, current: null }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ history: s.history }),
    },
  ),
);
