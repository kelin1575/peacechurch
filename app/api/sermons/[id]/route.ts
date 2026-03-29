import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sermon = await prisma.sermon.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!sermon) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(sermon);
  } catch (error) {
    console.error("Sermon fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const sermon = await prisma.sermon.update({
      where: { id },
      data: {
        title: body.title,
        scripture: body.scripture,
        summary: body.summary,
        interpretation: body.interpretation,
        category: body.category,
      },
    });

    return NextResponse.json(sermon);
  } catch (error) {
    console.error("Sermon update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.sermon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sermon delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
