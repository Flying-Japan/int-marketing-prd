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
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useProposalStore } from "@/stores/proposal-store";
import type { SlideData } from "@/types/proposal";

export function StepAdjust() {
  const { current, updateDraft, prevStep, nextStep } = useProposalStore();
  const draft = current?.draft;

  if (!draft) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        아이디어 제안 결과가 표시됩니다.
      </div>
    );
  }

  function updateSlide(id: string, patch: Partial<SlideData>) {
    if (!draft) return;
    updateDraft({
      slides: draft.slides.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    });
  }

  function removeSlide(id: string) {
    if (!draft) return;
    updateDraft({
      slides: draft.slides
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i + 1 })),
    });
  }

  function addSlide() {
    if (!draft) return;
    const newSlide: SlideData = {
      id: `s-${Date.now()}`,
      order: draft.slides.length + 1,
      type: "content",
      title: "새 슬라이드",
      body: "",
    };
    updateDraft({ slides: [...draft.slides, newSlide] });
  }

  const slideTypeLabel: Record<string, string> = {
    cover: "표지",
    toc: "목차",
    section: "섹션",
    content: "내용",
    chart: "차트",
    timeline: "타임라인",
    closing: "마무리",
  };

  const slideTypeColor: Record<string, string> = {
    cover: "bg-blue-100 text-blue-800",
    toc: "bg-purple-100 text-purple-800",
    section: "bg-amber-100 text-amber-800",
    content: "bg-green-100 text-green-800",
    chart: "bg-cyan-100 text-cyan-800",
    timeline: "bg-orange-100 text-orange-800",
    closing: "bg-rose-100 text-rose-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">STEP 2</h2>
        <p className="text-muted-foreground">
          AI가 생성한 초안을 검토하고 보정합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              슬라이드 구성{" "}
              <span className="text-muted-foreground font-normal">
                ({draft.slides.length} slides)
              </span>
            </span>
            <Button variant="outline" size="sm" onClick={addSlide}>
              <Plus className="mr-1 h-3 w-3" />
              추가
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {draft.slides.map((slide) => (
              <div
                key={slide.id}
                className="group flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 pt-1 shrink-0">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono w-5 text-right">
                    {slide.order}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${slideTypeColor[slide.type] || ""}`}
                    >
                      {slideTypeLabel[slide.type] || slide.type}
                    </Badge>
                    <Input
                      value={slide.title}
                      onChange={(e) =>
                        updateSlide(slide.id, { title: e.target.value })
                      }
                      className="h-7 text-sm font-medium"
                      placeholder="슬라이드 제목"
                    />
                  </div>

                  {slide.subtitle !== undefined && (
                    <Input
                      value={slide.subtitle || ""}
                      onChange={(e) =>
                        updateSlide(slide.id, { subtitle: e.target.value })
                      }
                      className="h-7 text-xs"
                      placeholder="부제목"
                    />
                  )}

                  {slide.body !== undefined && (
                    <Textarea
                      value={slide.body || ""}
                      onChange={(e) =>
                        updateSlide(slide.id, { body: e.target.value })
                      }
                      className="text-xs min-h-[60px]"
                      placeholder="본문 내용"
                    />
                  )}

                  {slide.bullets && slide.bullets.length > 0 && (
                    <Textarea
                      value={slide.bullets.join("\n")}
                      onChange={(e) =>
                        updateSlide(slide.id, {
                          bullets: e.target.value.split("\n"),
                        })
                      }
                      className="text-xs min-h-[60px]"
                      placeholder="불릿 포인트 (줄바꿈으로 구분)"
                    />
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={() => removeSlide(slide.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          이전
        </Button>
        <Button onClick={nextStep}>
          다음: 실행/견적 확정
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
