import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { Answer } from "@/components/shared/types/quiz-types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";


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

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Пользователь не найден" },
      { status: 404 }
    );
  }

  const { answers, duration } = (await req.json()) as {
    answers: Record<string, Answer>;
    duration?: number;
  };

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

  const detailedResults = quiz.questions.map((question) => {
    const userAnswer = answers[question.id.toString()];
    let isCorrect = false;

    switch (question.type) {
      case "SINGLE": {
        const correctIndex = question.options.findIndex((o) => o.isCorrect);
        isCorrect =
          userAnswer?.type === "single" &&
          userAnswer.selectedIndex === correctIndex;
        break;
      }

      case "MULTIPLE": {
        if (userAnswer?.type === "multiple") {
          const correctIndexes = question.options
            .map((o, i) => (o.isCorrect ? i : null))
            .filter((i): i is number => i !== null);
          const sortedUser = [...userAnswer.selectedIndexes].sort();
          const sortedCorrect = [...correctIndexes].sort();
          isCorrect =
            sortedUser.length === sortedCorrect.length &&
            sortedUser.every((val, i) => val === sortedCorrect[i]);
        }
        break;
      }

      case "TEXT": {
        isCorrect =
          userAnswer?.type === "text" &&
          userAnswer.text.trim().toLowerCase() ===
            question.textAnswer?.answer.trim().toLowerCase();
        break;
      }

      case "MATCH": {
        isCorrect =
          userAnswer?.type === "match" &&
          userAnswer.pairs.length === question.matchPairs.length &&
          userAnswer.pairs.every(
            (p, i) =>
              p.left === question.matchPairs[i].left &&
              p.right === question.matchPairs[i].right
          );
        break;
      }
    }

    if (isCorrect) correct++;

    return {
      questionId: question.id,
      isCorrect,
      correctAnswer: {
        type: question.type,
        correctIndexes:
          question.options
            ?.map((o, i) => (o.isCorrect ? i : null))
            .filter((i): i is number => i !== null) ?? [],
        correctText: question.textAnswer?.answer ?? null,
        correctPairs: question.matchPairs ?? [],
      },
    };
  });
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  await prisma.quizResult.create({
    data: {
      userId: user.id,
      quizId: quiz.id,
      score: percentage,
      duration: duration ?? null,
    },
  });

  return NextResponse.json({
    score: correct,
    total,
    detailedResults,
  });
}
