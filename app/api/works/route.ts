import { prisma } from "@/prisma/prisma-client";
import { NextResponse } from "next/server";

export async function GET() {
  const works = await prisma.work.findMany({
    include: { poet: true }, 
  });
  return NextResponse.json(works);
}
