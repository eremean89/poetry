import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  const workId = Number(id);

  if (isNaN(workId)) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  const work = await prisma.work.findUnique({
    where: { id: workId },
    include: {
      poet: true,
      media: true,
    },
  });

  if (!work) {
    return NextResponse.json(
      { error: "Произведение не найдено" },
      { status: 404 }
    );
  }

  const audios = work.media
    .filter((m) => m.type === "AUDIO")
    .map((m) => ({ title: m.title, url: m.url }));

  return NextResponse.json({
    id: work.id,
    title: work.title,
    content: work.content,
    poet: work.poet,
    audios,
  });
}
