import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import photosData from "@/photos.json";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  const poetId = Number(id);

  if (isNaN(poetId)) {
    return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
  }

  const poet = await prisma.poet.findUnique({
    where: { id: poetId },
    include: {
      works: true,
      media: true,
    },
  });

  if (!poet) {
    return NextResponse.json({ error: "Поэт не найден" }, { status: 404 });
  }

  const key = poetId.toString() as keyof typeof photosData;
  const photos = photosData[key] || [];

  const audios = poet.media
    .filter((m) => m.type === "AUDIO")
    .map((m) => ({ title: m.title, url: m.url }));

  const videos = poet.media
    .filter((m) => m.type === "VIDEO")
    .map((m) => ({ title: m.title, url: m.url }));

  return NextResponse.json({
    ...poet,
    photos,
    audios,
    videos,
  });
}
