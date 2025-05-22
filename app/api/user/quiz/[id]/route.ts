import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { Answer } from "@/app/types/quiz-types";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "Нет ID" }, { status: 400 });
  }

  try {
    const quiz = await prisma.quiz.findFirst({
      where: { poetId: parseInt(id) },
      include: {
        questions: {
          include: {
            options: true,
            matchPairs: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Тест не найден" }, { status: 404 });
    }

    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.prompt,
      type: q.type.toLowerCase(),
      options: q.options?.map((o) => ({ text: o.text })) ?? [],
      matchPairs: q.matchPairs ?? [],
    }));

    return NextResponse.json({
      title: quiz.title,
      questions: sanitizedQuestions,
    });
  } catch (err) {
    console.error("Ошибка при получении теста:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  if (!id) {
    return NextResponse.json({ error: "Нет ID" }, { status: 400 });
  }

  const body = await req.json();
  const answers: Record<string, Answer> = body.answers;

  const quiz = await prisma.quiz.findFirst({
    where: { poetId: parseInt(id, 10) },
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
    return NextResponse.json({ error: "Тест не найден" }, { status: 404 });
  }

  let correct = 0;
  const total = quiz.questions.length;

  for (const question of quiz.questions) {
    const userAnswer = answers[question.id.toString()];
    if (!userAnswer) continue;

    switch (question.type) {
      case "SINGLE": {
        const correctIndex = question.options.findIndex((o) => o.isCorrect);
        if (
          userAnswer.type === "single" &&
          userAnswer.selectedIndex === correctIndex
        ) {
          correct++;
        }
        break;
      }

      case "MULTIPLE": {
        if (userAnswer.type !== "multiple") break;
        const correctIndexes = question.options
          .map((o, i) => (o.isCorrect ? i : null))
          .filter((i): i is number => i !== null);
        const sortedUser = [...userAnswer.selectedIndexes].sort();
        const sortedCorrect = [...correctIndexes].sort();
        if (
          sortedUser.length === sortedCorrect.length &&
          sortedUser.every((val, i) => val === sortedCorrect[i])
        ) {
          correct++;
        }
        break;
      }

      case "TEXT": {
        if (userAnswer.type !== "text") break;
        const correctText = question.textAnswer?.answer.trim().toLowerCase();
        const userText = userAnswer.text.trim().toLowerCase();
        if (correctText && userText === correctText) {
          correct++;
        }
        break;
      }

      case "MATCH": {
        if (userAnswer.type !== "match") break;
        const correctPairs = question.matchPairs.map((p) => ({
          left: p.left,
          right: p.right,
        }));
        const allMatched =
          userAnswer.pairs.length === correctPairs.length &&
          userAnswer.pairs.every(
            (up, index) =>
              up.left === correctPairs[index].left &&
              up.right === correctPairs[index].right
          );

        if (allMatched) {
          correct++;
        }
        break;
      }
    }
  }

  return NextResponse.json({ score: correct, total });
}
