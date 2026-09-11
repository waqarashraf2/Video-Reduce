import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("[User Feedback Received]:", {
      tool: data.tool,
      rating: data.rating,
      comment: data.comment,
      name: data.name,
      tag: data.tag,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Feedback received successfully" });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }
}
