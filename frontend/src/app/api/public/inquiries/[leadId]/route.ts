import { NextResponse } from "next/server";
import { fetchBackendJson } from "@/lib/backend";

type InquiryRouteProps = {
  params: Promise<{
    leadId: string;
  }>;
};

export async function GET(_request: Request, { params }: InquiryRouteProps) {
  const { leadId } = await params;

  try {
    const inquiry = await fetchBackendJson(`/api/public/inquiries/${leadId}`);
    return NextResponse.json(inquiry);
  } catch {
    return NextResponse.json(
      { message: "Inquiry could not be loaded." },
      { status: 404 },
    );
  }
}
