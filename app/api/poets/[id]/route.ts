import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import fs from "fs";
import path from "path";

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

  const photosDir = path.join(
    process.cwd(),
    "public",
    "media",
    "poets",
    String(poetId),
    "photos"
  );

  let photos: string[] = [];
  if (fs.existsSync(photosDir)) {
    photos = fs
      .readdirSync(photosDir)
      .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
  }

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
