"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useProposalStore } from "@/stores/proposal-store";
import type { ExecutionItem, QuoteItem } from "@/types/proposal";

export function StepConfirm() {
  const { current, updateDraft, prevStep, nextStep, setStatus } =
    useProposalStore();
  const draft = current?.draft;

  if (!draft) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        초안을 먼저 생성해주세요.
      </div>
    );
  }

  function toggleExecution(id: string) {
    updateDraft({
      executionItems: draft!.executionItems.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    });
  }

  function updateExecution(id: string, patch: Partial<ExecutionItem>) {
    updateDraft({
      executionItems: draft!.executionItems.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function addExecution() {
    const newItem: ExecutionItem = {
      id: `ex-${Date.now()}`,
      category: "기타",
      title: "",
      description: "",
      enabled: true,
    };
    updateDraft({ executionItems: [...draft!.executionItems, newItem] });
  }

  function removeExecution(id: string) {
    updateDraft({
      executionItems: draft!.executionItems.filter((item) => item.id !== id),
    });
  }

  function updateQuote(id: string, patch: Partial<QuoteItem>) {
    updateDraft({
      quoteItems: draft!.quoteItems.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }

  function addQuote() {
    const newItem: QuoteItem = {
      id: `qt-${Date.now()}`,
      name: "",
      unit: "건",
      quantity: 1,
      unitPrice: 0,
      note: "",
    };
    updateDraft({ quoteItems: [...draft!.quoteItems, newItem] });
  }

  function removeQuote(id: string) {
    updateDraft({
      quoteItems: draft!.quoteItems.filter((item) => item.id !== id),
    });
  }

  const totalQuote = draft.quoteItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const enabledCount = draft.executionItems.filter((i) => i.enabled).length;

  function handleConfirm() {
    setStatus("confirmed");
    nextStep();
  }

  const categoryColors: Record<string, string> = {
    SNS: "bg-pink-100 text-pink-800",
    광고: "bg-blue-100 text-blue-800",
    콘텐츠: "bg-green-100 text-green-800",
    컨설팅: "bg-purple-100 text-purple-800",
    이벤트: "bg-amber-100 text-amber-800",
    기타: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">STEP 3</h2>
        <p className="text-muted-foreground">
          실행항목과 견적을 확정합니다.
        </p>
      </div>

      {/* Execution Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              실행항목{" "}
              <span className="text-muted-foreground font-normal">
                ({enabledCount}/{draft.executionItems.length}개 활성)
              </span>
            </span>
            <Button variant="outline" size="sm" onClick={addExecution}>
              <Plus className="mr-1 h-3 w-3" />
              추가
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {draft.executionItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                item.enabled ? "hover:bg-muted/50" : "opacity-50 bg-muted/30"
              }`}
            >
              <button
                onClick={() => toggleExecution(item.id)}
                className="pt-0.5 shrink-0"
              >
                {item.enabled ? (
                  <ToggleRight className="h-5 w-5 text-primary" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] shrink-0 ${categoryColors[item.category] || categoryColors["기타"]}`}
                  >
                    {item.category}
                  </Badge>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      updateExecution(item.id, { title: e.target.value })
                    }
                    className="h-7 text-sm font-medium"
                    placeholder="실행항목 제목"
                  />
                </div>
                <Textarea
                  value={item.description}
                  onChange={(e) =>
                    updateExecution(item.id, { description: e.target.value })
                  }
                  className="text-xs min-h-[40px]"
                  placeholder="상세 설명"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 opacity-0 group-hover:opacity-100 h-7 w-7"
                onClick={() => removeExecution(item.id)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quote Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              견적항목{" "}
              <span className="text-muted-foreground font-normal">
                ({draft.quoteItems.length}개)
              </span>
            </span>
            <Button variant="outline" size="sm" onClick={addQuote}>
              <Plus className="mr-1 h-3 w-3" />
              추가
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_60px_70px_90px_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>항목</span>
              <span>단위</span>
              <span>수량</span>
              <span className="text-right">단가(¥)</span>
              <span />
            </div>
            {draft.quoteItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_60px_70px_90px_40px] gap-2 items-center group"
              >
                <Input
                  value={item.name}
                  onChange={(e) =>
                    updateQuote(item.id, { name: e.target.value })
                  }
                  className="h-8 text-sm"
                  placeholder="항목명"
                />
                <Input
                  value={item.unit}
                  onChange={(e) =>
                    updateQuote(item.id, { unit: e.target.value })
                  }
                  className="h-8 text-xs text-center"
                />
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuote(item.id, {
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-8 text-xs text-center"
                />
                <Input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateQuote(item.id, {
                      unitPrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-8 text-xs text-right"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => removeQuote(item.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end items-center gap-4 text-sm">
            <span className="text-muted-foreground">합계</span>
            <span className="font-bold text-lg">
              ¥{totalQuote.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={draft.budget}
              onChange={(e) => updateDraft({ budget: e.target.value })}
              placeholder="총 예산 (예: 총 ¥500,000 (VAT별도))"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={draft.schedule}
              onChange={(e) => updateDraft({ schedule: e.target.value })}
              placeholder="일정 (예: 2026년 3월~5월 (3개월))"
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          이전
        </Button>
        <Button onClick={handleConfirm}>
          확정 및 생성
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
