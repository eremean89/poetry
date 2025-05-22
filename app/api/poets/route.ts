import { prisma } from "@/prisma/prisma-client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const poets = await prisma.poet.findMany({
      orderBy: { name: "asc" }, 
    });

    return NextResponse.json(poets);
  } catch (error) {
    console.error("Ошибка при получении поэтов:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
