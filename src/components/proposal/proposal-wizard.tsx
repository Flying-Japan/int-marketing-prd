"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { History, Plus } from "lucide-react";
import { useProposalStore } from "@/stores/proposal-store";
import { StepMeeting } from "./step-meeting";
import { StepAdjust } from "./step-adjust";
import { StepConfirm } from "./step-confirm";
import { StepGenerate } from "./step-generate";
import { HistoryPanel } from "./history-panel";

const steps = [
  { label: "자동제안", description: "미팅 메모 입력" },
  { label: "보정", description: "슬라이드 보정" },
  { label: "실행/견적", description: "견적 확정" },
  { label: "생성", description: "검토 및 배포" },
];

export function ProposalWizard() {
  const { currentStep, setStep, reset, current } = useProposalStore();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight">
              FLYING Proposal Studio
            </h1>
            {current && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                — {current.clientName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <Plus className="mr-1 h-3 w-3" />
              새 제안서
            </Button>

            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="mr-1 h-3 w-3" />
                  내역
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[380px] p-0">
                <HistoryPanel onClose={() => setHistoryOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1">
            {steps.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              const isClickable = current !== null || i === 0;

              return (
                <button
                  key={i}
                  onClick={() => isClickable && setStep(i)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                        : isClickable
                          ? "text-muted-foreground hover:bg-muted cursor-pointer"
                          : "text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : isDone
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}

            <div className="ml-auto text-[10px] text-muted-foreground hidden sm:block">
              추천 순서: STEP1 자동제안 → STEP2 보정 → STEP3 실행/견적 확정 →
              STEP4 생성
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentStep === 0 && <StepMeeting />}
        {currentStep === 1 && <StepAdjust />}
        {currentStep === 2 && <StepConfirm />}
        {currentStep === 3 && <StepGenerate />}
      </main>
    </div>
  );
}
