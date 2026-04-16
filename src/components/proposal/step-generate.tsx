"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ExternalLink,
  FileJson,
  Loader2,
  Presentation,
  Save,
} from "lucide-react";
import { useProposalStore } from "@/stores/proposal-store";
import { validateProposalDraft } from "@/lib/proposal-validation";
import { toast } from "sonner";

export function StepGenerate() {
  const { current, updateDraft, setSlidesUrl, saveToHistory, prevStep } =
    useProposalStore();
  const draft = current?.draft;
  const [generating, setGenerating] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState("");

  if (!draft) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        생성 후 슬라이드 요약이 표시됩니다.
      </div>
    );
  }

  async function handleGenerateSlides() {
    if (!current?.draft) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: current.clientName,
          projectName: current.draft.theme,
          slides: current.draft.slides,
          budget: current.draft.budget,
          schedule: current.draft.schedule,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Slides generation failed");
      }

      const data = await res.json();
      setSlidesUrl(data.url);
      saveToHistory();
      toast.success("Google Slides가 생성되었습니다!");
    } catch (e) {
      toast.error(
        `생성 실패: ${e instanceof Error ? e.message : "알 수 없는 오류"}`,
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleSave() {
    saveToHistory();
    toast.success("제안서가 저장되었습니다.");
  }

  function handleShowJson() {
    setJsonText(JSON.stringify(draft, null, 2));
    setShowJson(!showJson);
  }

  function handleApplyJson() {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = validateProposalDraft(parsed);
      if (!validation.ok) {
        throw new Error(validation.error);
      }
      updateDraft(validation.value);
      toast.success("Deck JSON이 적용되었습니다.");
      setShowJson(false);
    } catch (e) {
      toast.error(
        `잘못된 JSON 형식입니다. ${e instanceof Error ? e.message : ""}`.trim(),
      );
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">STEP 4</h2>
        <p className="text-muted-foreground">검토 및 배포</p>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">제안서 요약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">클라이언트</span>
              <p className="font-medium">{current?.clientName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">테마</span>
              <p className="font-medium">{draft.theme}</p>
            </div>
            <div>
              <span className="text-muted-foreground">슬라이드</span>
              <p className="font-medium">{draft.slides.length} slides</p>
            </div>
            <div>
              <span className="text-muted-foreground">실행항목</span>
              <p className="font-medium">
                {draft.executionItems.filter((i) => i.enabled).length}개
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">예산</span>
              <p className="font-medium">{draft.budget}</p>
            </div>
            <div>
              <span className="text-muted-foreground">일정</span>
              <p className="font-medium">{draft.schedule}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">슬라이드 구성</p>
            <div className="flex flex-wrap gap-1.5">
              {draft.slides.map((slide) => (
                <Badge
                  key={slide.id}
                  variant="outline"
                  className="text-[10px]"
                >
                  {slide.order}. {slideTypeLabel[slide.type] || slide.type}:{" "}
                  {slide.title.slice(0, 20)}
                  {slide.title.length > 20 ? "..." : ""}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          onClick={handleGenerateSlides}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Google Slides 생성 중...
            </>
          ) : (
            <>
              <Presentation className="mr-2 h-4 w-4" />
              Google Slides 생성
            </>
          )}
        </Button>

        <Button variant="outline" size="lg" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          저장
        </Button>

        <Button variant="outline" size="lg" onClick={handleShowJson}>
          <FileJson className="mr-2 h-4 w-4" />
          Deck JSON 직접 편집(고급)
        </Button>
      </div>

      {/* Slides URL */}
      {current?.slidesUrl && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Presentation className="h-5 w-5 text-green-700" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Google Slides 생성 완료
                </p>
                <a
                  href={current.slidesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:underline break-all"
                >
                  {current.slidesUrl}
                </a>
              </div>
              <a
                href={current.slidesUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  열기
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Editor */}
      {showJson && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deck JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="min-h-[300px] font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleApplyJson}>
                적용
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowJson(false)}
              >
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          이전
        </Button>
      </div>
    </div>
  );
}
