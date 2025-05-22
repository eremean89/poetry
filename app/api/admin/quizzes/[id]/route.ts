import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { QuestionType } from "@prisma/client";

interface Option {
  text: string;
  isCorrect?: boolean;
}

interface MatchPair {
  left: string;
  right: string;
}

interface Question {
  poetId: number;
  question: string;
  type: "SINGLE" | "MULTIPLE" | "MATCH" | "TEXT";
  options?: Option[];
  matchPairs?: MatchPair[];
  textAnswer?: {
    answer: string;
  };
}

// ---------- GET ----------
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); 


  if (!id) {
    return NextResponse.json(
      { success: false, error: "Нет ID произведения" },
      { status: 400 }
    );
  }

  try {
    const quiz = await prisma.quiz.findFirst({
      where: { poetId: parseInt(id) },
      include: {
        questions: {
          include: {
            options: true,
            matchPairs: true,
            textAnswer: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Тест не найден" },
        { status: 404 }
      );
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Вопросы отсутствуют в тесте" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error("Ошибка при получении теста:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка при получении теста" },
      { status: 500 }
    );
  }
}

// ---------- POST (Create or Update) ----------
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  const body = await req.json();

  const rawQuestions = Array.isArray(body) ? body : body.questions;
  const questions: Question[] = Array.isArray(rawQuestions)
    ? rawQuestions
    : Object.values(rawQuestions);

  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Вопросы отсутствуют или имеют неверный формат",
      },
      { status: 400 }
    );
  }

  const poetId = parseInt(id!);

  try {
    const existing = await prisma.quiz.findFirst({
      where: { poetId },
    });

    if (existing) {
      await prisma.option.deleteMany({
        where: {
          question: {
            quizId: existing.id,
          },
        },
      });

      await prisma.matchPair.deleteMany({
        where: {
          question: {
            quizId: existing.id,
          },
        },
      });

      await prisma.textAnswer.deleteMany({
        where: {
          question: {
            quizId: existing.id,
          },
        },
      });


      await prisma.question.deleteMany({
        where: { quizId: existing.id },
      });


      await prisma.quiz.update({
        where: { id: existing.id },
        data: {
          title: body.title ?? existing.title,
          questions: {
            create: questions.map((q) => {
              const base = {
                prompt: q.question,
                type: q.type.toUpperCase() as QuestionType,
              };

              if (q.type === "TEXT" && q.textAnswer?.answer !== undefined) {
                return {
                  ...base,
                  textAnswer: {
                    create: {
                      answer: q.textAnswer.answer,
                    },
                  },
                };
              }

              if (
                (q.type === "SINGLE" || q.type === "MULTIPLE") &&
                q.options?.length
              ) {
                return {
                  ...base,
                  options: {
                    create: q.options.map((opt) => ({
                      text: opt.text,
                      isCorrect: opt.isCorrect ?? false,
                    })),
                  },
                };
              }

              if (q.type === "MATCH" && q.matchPairs?.length) {
                return {
                  ...base,
                  matchPairs: {
                    create: q.matchPairs.map((pair) => ({
                      left: pair.left,
                      right: pair.right,
                    })),
                  },
                };
              }

              return base;
            }),
          },
        },
      });

      return NextResponse.json({ success: true, quizId: existing.id });
    } else {
      const quiz = await prisma.quiz.create({
        data: {
          title: body.title ?? `Тест для поэта ${poetId}`,
          poetId,
          questions: {
            create: questions.map((q) => {
              const base = {
                prompt: q.question,
                type: q.type.toUpperCase() as QuestionType,
              };

              if (q.type === "TEXT" && q.textAnswer?.answer !== undefined) {
                return {
                  ...base,
                  textAnswer: {
                    create: {
                      answer: q.textAnswer.answer,
                    },
                  },
                };
              }

              if (
                (q.type === "SINGLE" || q.type === "MULTIPLE") &&
                q.options?.length
              ) {
                return {
                  ...base,
                  options: {
                    create: q.options.map((opt) => ({
                      text: opt.text,
                      isCorrect: opt.isCorrect ?? false,
                    })),
                  },
                };
              }

              if (q.type === "MATCH" && q.matchPairs?.length) {
                return {
                  ...base,
                  matchPairs: {
                    create: q.matchPairs.map((pair) => ({
                      left: pair.left,
                      right: pair.right,
                    })),
                  },
                };
              }

              return base;
            }),
          },
        },
      });

      return NextResponse.json({ success: true, quizId: quiz.id });
    }
  } catch (error) {
    console.error("Ошибка при сохранении теста:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка при сохранении теста" },
      { status: 500 }
    );
  }
}
