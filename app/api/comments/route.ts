import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sermonId, author, content } = body;

    if (!sermonId || !author || !content) {
      return NextResponse.json(
        { error: "sermonId, author, content are required" },
        { status: 400 }
      );
    }

    if (author.length > 20 || content.length > 500) {
      return NextResponse.json(
        { error: "Content too long" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        sermonId,
        author: author.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sermonId = searchParams.get("sermonId");

    if (!sermonId) {
      return NextResponse.json({ error: "sermonId is required" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { sermonId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
