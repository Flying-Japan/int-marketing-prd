"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useProposalStore } from "@/stores/proposal-store";
import type { MeetingInput } from "@/types/proposal";
import { toast } from "sonner";

export function StepMeeting() {
  const { current, startNew, setDraft, nextStep } = useProposalStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MeetingInput>({
    clientName: current?.meeting.clientName ?? "",
    meetingMemo: current?.meeting.meetingMemo ?? "",
    storeFeatures: current?.meeting.storeFeatures ?? "",
    requirements: current?.meeting.requirements ?? "",
  });

  const charCount = form.meetingMemo.length;
  const canSubmit =
    form.clientName.trim() !== "" && form.meetingMemo.trim() !== "";

  async function handleGenerate() {
    if (!canSubmit) return;

    startNew(form);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const draft = await res.json();
      setDraft(draft);
      toast.success("제안서 초안이 생성되었습니다.");
      nextStep();
    } catch (e) {
      toast.error(
        `생성 실패: ${e instanceof Error ? e.message : "알 수 없는 오류"}`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">STEP 1</h2>
        <p className="text-muted-foreground">
          미팅 정보를 입력하면 AI가 제안서 초안을 자동 생성합니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">미팅 메모</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">클라이언트명</Label>
              <Input
                id="clientName"
                placeholder="예: 오키나와 사우스 웨스트 호텔"
                value={form.clientName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientName: e.target.value }))
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingMemo">
                미팅 메모{" "}
                <span className="text-muted-foreground font-normal">
                  ({charCount}자)
                </span>
              </Label>
              <Textarea
                id="meetingMemo"
                placeholder="미팅 내용을 자유롭게 기록하세요. AI가 구조화된 제안서로 변환합니다."
                className="min-h-[200px]"
                value={form.meetingMemo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meetingMemo: e.target.value }))
                }
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">점포 특징</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="점포/사업의 특징, 강점, 위치 등"
                className="min-h-[100px]"
                value={form.storeFeatures}
                onChange={(e) =>
                  setForm((f) => ({ ...f, storeFeatures: e.target.value }))
                }
                disabled={loading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">요청사항</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="고객의 구체적인 요청사항, 목표, 예산 범위 등"
                className="min-h-[100px]"
                value={form.requirements}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requirements: e.target.value }))
                }
                disabled={loading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              AI 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              자동 제안 생성
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
