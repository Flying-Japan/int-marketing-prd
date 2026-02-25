import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a senior advertising strategist for Flying Japan, a tourism marketing agency based in Osaka.
Given meeting notes about a client (hotel, restaurant, tourism spot, etc.), generate a structured advertising proposal.

Output JSON with this exact shape:
{
  "theme": "short project theme/title",
  "executionItems": [
    { "id": "ex-1", "category": "SNS", "title": "Instagram campaign", "description": "...", "enabled": true }
  ],
  "quoteItems": [
    { "id": "qt-1", "name": "Instagram content production", "unit": "건", "quantity": 1, "unitPrice": 50000, "note": "" }
  ],
  "budget": "총 ¥XXX,XXX (VAT별도)",
  "schedule": "2026년 3월~5월 (3개월)",
  "slides": [
    { "id": "s-1", "order": 1, "type": "cover", "title": "...", "subtitle": "..." },
    { "id": "s-2", "order": 2, "type": "toc", "title": "목차", "bullets": ["..."] },
    ...more slides (18-24 total)
  ]
}

Slide types: cover, toc, section, content, chart, timeline, closing.
Content should be professional Korean with some English where natural.
Generate 20-24 slides covering: cover, ToC, client analysis, market analysis, strategy overview, target audience, execution plans (SNS, content, ads, etc.), timeline, budget summary, expected results, closing.
Quote prices in JPY (¥). Categories: SNS, 광고, 콘텐츠, 컨설팅, 이벤트, 기타.`;

export async function POST(req: NextRequest) {
  const { clientName, meetingMemo, storeFeatures, requirements } =
    await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 },
    );
  }

  const userPrompt = `클라이언트: ${clientName}
미팅 메모: ${meetingMemo}
점포/사업 특징: ${storeFeatures}
요청사항: ${requirements}

위 정보를 바탕으로 광고 제안서를 생성해주세요.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${err}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 },
      );
    }

    const draft = JSON.parse(content);
    return NextResponse.json(draft);
  } catch (e) {
    return NextResponse.json(
      { error: `Generation failed: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
}
