import { NextResponse } from "next/server";
import { fetchBackendJson } from "@/lib/backend";

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    const inquiry = await fetchBackendJson("/api/public/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Inquiry could not be saved." },
      { status: 502 },
    );
  }
}
