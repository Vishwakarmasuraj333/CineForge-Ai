import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    app: "CineForge AI Frontend",
    timestamp: new Date().toISOString(),
  });
}

