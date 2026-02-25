"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Trash2, Upload, X } from "lucide-react";
import { useProposalStore } from "@/stores/proposal-store";
import { format } from "date-fns";

interface HistoryPanelProps {
  onClose: () => void;
}

export function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { history, loadFromHistory, deleteFromHistory } = useProposalStore();

  const statusLabel: Record<string, string> = {
    draft: "초안",
    review: "검토중",
    confirmed: "확정",
    generated: "생성완료",
  };

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    review: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    generated: "bg-green-100 text-green-700",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">제안서 내역</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              저장된 제안서가 없습니다.
            </p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="group rounded-lg border p-3 hover:bg-muted/50 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.clientName} 광고 제안서
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.slideCount} slides
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] shrink-0 ${statusColor[entry.status] || ""}`}
                  >
                    {statusLabel[entry.status] || entry.status}
                  </Badge>
                </div>

                <div className="text-[10px] text-muted-foreground">
                  <span>{entry.clientName}</span>
                  <span className="mx-1">|</span>
                  <span>{entry.projectName || "제목 없음"}</span>
                  <span className="mx-1">|</span>
                  <span>
                    {format(new Date(entry.createdAt), "yyyy. M. d. HH시 mm분 ss초")}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={() => {
                      loadFromHistory(entry.id);
                      onClose();
                    }}
                  >
                    <Upload className="mr-1 h-3 w-3" />
                    불러오기
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      if (confirm("삭제할까요?")) {
                        deleteFromHistory(entry.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
