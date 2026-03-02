import { NextRequest, NextResponse } from "next/server";
import type { SlideData } from "@/types/proposal";

export const runtime = "edge";

// Google Slides API integration
// Requires: GOOGLE_SERVICE_ACCOUNT_KEY (JSON), GOOGLE_SLIDES_TEMPLATE_ID

interface SlideRequest {
  clientName: string;
  projectName: string;
  slides: SlideData[];
  budget: string;
  schedule: string;
}

export async function POST(req: NextRequest) {
  const body: SlideRequest = await req.json();
  const saKeyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const templateId = process.env.GOOGLE_SLIDES_TEMPLATE_ID;

  if (!saKeyJson) {
    // Fallback: return a mock URL for development
    return NextResponse.json({
      url: `https://docs.google.com/presentation/d/mock-${Date.now()}/edit`,
      message: "GOOGLE_SERVICE_ACCOUNT_KEY not configured. Returning mock URL.",
      mock: true,
    });
  }

  try {
    const saKey = JSON.parse(saKeyJson);
    const accessToken = await getAccessToken(saKey);

    // Step 1: Copy template
    const copyRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${templateId}/copy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${body.clientName} 광고 제안서`,
        }),
      },
    );

    if (!copyRes.ok) {
      throw new Error(`Drive copy failed: ${await copyRes.text()}`);
    }

    const { id: presentationId } = await copyRes.json();

    // Step 2: Build batch update requests for slides
    const requests = buildSlideRequests(body.slides, body);

    if (requests.length > 0) {
      const updateRes = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests }),
        },
      );

      if (!updateRes.ok) {
        console.error("Slides update warning:", await updateRes.text());
      }
    }

    // Step 3: Make it publicly viewable
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${presentationId}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      },
    );

    const url = `https://docs.google.com/presentation/d/${presentationId}/edit`;
    return NextResponse.json({ url, mock: false });
  } catch (e) {
    return NextResponse.json(
      { error: `Slides generation failed: ${e instanceof Error ? e.message : e}` },
      { status: 500 },
    );
  }
}

async function getAccessToken(
  saKey: { client_email: string; private_key: string },
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = btoa(
    JSON.stringify({
      iss: saKey.client_email,
      scope:
        "https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );

  // Use Web Crypto for RS256 signing
  const encoder = new TextEncoder();
  const pemBody = saKey.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(`${header}.${claim}`),
  );
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${header}.${claim}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

function buildSlideRequests(
  slides: SlideData[],
  meta: { clientName: string; budget: string; schedule: string },
) {
  // Build placeholder replacement requests
  // This maps slide data to template placeholders
  const requests: Record<string, unknown>[] = [];

  // Replace global placeholders
  requests.push({
    replaceAllText: {
      containsText: { text: "{{CLIENT_NAME}}", matchCase: false },
      replaceText: meta.clientName,
    },
  });
  requests.push({
    replaceAllText: {
      containsText: { text: "{{BUDGET}}", matchCase: false },
      replaceText: meta.budget,
    },
  });
  requests.push({
    replaceAllText: {
      containsText: { text: "{{SCHEDULE}}", matchCase: false },
      replaceText: meta.schedule,
    },
  });

  // Replace slide-specific placeholders
  slides.forEach((slide, i) => {
    const num = String(i + 1).padStart(2, "0");
    if (slide.title) {
      requests.push({
        replaceAllText: {
          containsText: { text: `{{TITLE_${num}}}`, matchCase: false },
          replaceText: slide.title,
        },
      });
    }
    if (slide.subtitle) {
      requests.push({
        replaceAllText: {
          containsText: { text: `{{SUBTITLE_${num}}}`, matchCase: false },
          replaceText: slide.subtitle,
        },
      });
    }
    if (slide.body) {
      requests.push({
        replaceAllText: {
          containsText: { text: `{{BODY_${num}}}`, matchCase: false },
          replaceText: slide.body,
        },
      });
    }
    if (slide.bullets?.length) {
      requests.push({
        replaceAllText: {
          containsText: { text: `{{BULLETS_${num}}}`, matchCase: false },
          replaceText: slide.bullets.join("\n"),
        },
      });
    }
  });

  return requests;
}
