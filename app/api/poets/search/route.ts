import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query") || "";


  const poets = await prisma.poet.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: 4, 
  });

  return NextResponse.json(poets);
}
