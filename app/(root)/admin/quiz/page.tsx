"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { flushSync } from "react-dom";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import QuestionBlock from "@/components/shared/question-block";
import { Question, ServerQuestion } from "@/app/types/quiz-types";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const QuestionItem = React.memo(
  ({
    q,
    qIndex,
    updateQuestion,
    updateOption,
    deleteOption,
    deleteQuestion,
    addOption,
  }: {
    q: Question;
    qIndex: number;
    updateQuestion: (index: number, updated: Partial<Question>) => void;
    updateOption: (qIndex: number, optIndex: number, value: string) => void;
    deleteOption: (qIndex: number, optIndex: number) => void;
    deleteQuestion: (index: number) => void;
    addOption: (index: number) => void;
  }) => {
    return (
      <div
        key={q.id}
        className="border p-4 rounded-xl bg-white shadow-sm space-y-4 flex flex-col"
      >
        <div className="flex items-start gap-2">
          <Textarea
            className="flex-grow focus-visible:ring-2 focus:ring-[#996633]"
            placeholder="Вопрос"
            value={q.question}
            onChange={(e) =>
              updateQuestion(qIndex, { question: e.target.value })
            }
          />
          <Button
            variant="ghost"
            className="p-2 text-red-700 border-none bg-transparent hover:bg-transparent rounded-lg mt-3"
            onClick={() => deleteQuestion(qIndex)}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Label>Тип вопроса</Label>
          <Select
            value={q.type}
            onValueChange={(value) => {
              updateQuestion(qIndex, {
                type: value as Question["type"],
                correctAnswerIndex:
                  value === "multiple" ? [] : value === "text" ? undefined : 0,
                textAnswer: value === "text" ? { answer: "" } : undefined,
              });
            }}
          >
            <SelectTrigger className="rounded-xl border border-[#996633] bg-transparent text-[#996633] px-4 py-2">
              <SelectValue placeholder="Выберите тип вопроса" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl">
              <SelectItem className="hover:bg-gray-100" value="single">
                Один правильный ответ
              </SelectItem>
              <SelectItem className="hover:bg-gray-100" value="multiple">
                Несколько правильных ответов
              </SelectItem>
              <SelectItem className="hover:bg-gray-100" value="match">
                Соответствие
              </SelectItem>
              <SelectItem className="hover:bg-gray-100" value="text">
                Текстовый ответ
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <QuestionBlock
          key={q.id}
          question={q}
          index={qIndex}
          updateQuestion={updateQuestion}
          updateOption={updateOption}
          deleteOption={deleteOption}
        />

        {(q.type === "single" || q.type === "multiple") && (
          <Button
            variant="ghost"
            className="bg-transparent hover:bg-transparent text-[#996633] rounded-xl px-2 py-1 text-sm w-fit self-center"
            onClick={() => addOption(qIndex)}
          >
            + Добавить вариант
          </Button>
        )}
      </div>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

export default function QuizAdminPage() {
  const { data: session, status } = useSession();
  const [poetId, setPoetId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const alertShownRef = useRef(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!poetId.trim()) return;

      try {
        const res = await fetch(`/api/admin/quizzes/${poetId}`);
        const data = await res.json();

        if (data.success && data.quiz) {
          if (!data.quiz.questions || data.quiz.questions.length === 0) {
            console.warn("Тест не содержит вопросов.");
            setQuestions([]);
          } else {
            const loadedQuestions = data.quiz.questions.map(
              (q: ServerQuestion) => {
                const base = {
                  id: uuidv4(),
                  question: q.question,
                  type: q.type.toLowerCase() as Question["type"],
                };

                if (q.type === "SINGLE" || q.type === "MULTIPLE") {
                  const correctIndexes =
                    q.options
                      ?.map((opt, i) => (opt.isCorrect ? i : null))
                      .filter((i): i is number => i !== null) ?? [];

                  return {
                    ...base,
                    options:
                      q.options?.map((opt) => ({ text: opt.text })) ?? [],
                    correctAnswerIndex:
                      q.type === "MULTIPLE"
                        ? correctIndexes
                        : (correctIndexes[0] ?? 0),
                  };
                }

                if (q.type === "MATCH") {
                  return { ...base, matchPairs: q.matchPairs ?? [] };
                }

                if (q.type === "TEXT") {
                  return {
                    ...base,
                    textAnswer: { answer: q.textAnswer?.answer ?? "" },
                  };
                }

                return base;
              }
            );

            setQuestions(loadedQuestions);
          }
        } else {
          setQuestions([]);
          console.warn("Тест не найден или пуст.");
        }
      } catch (err) {
        console.error("Ошибка при загрузке теста:", err);
        setQuestions([]);
      }
    };

    fetchQuiz();
  }, [poetId]);

  const scrollToBottom = () => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  const addOption = useCallback((qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, { text: "" }] } : q
      )
    );
  }, []);

  const deleteOption = useCallback((qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const question = prev[qIndex];

      if (question.type !== "single" && question.type !== "multiple") {
        return [...prev];
      }

      const options = question.options;

      if (!options || options.length <= 2) {
        if (!alertShownRef.current) {
          alertShownRef.current = true;
          setTimeout(() => {
            alert("Должно быть минимум два варианта ответа");
            alertShownRef.current = false;
          }, 0);
        }
        return [...prev];
      }

      const newOptions = options.filter((_, i) => i !== optIndex);

      let newCorrect = question.correctAnswerIndex;
      if (Array.isArray(newCorrect)) {
        newCorrect = newCorrect
          .filter((i) => i !== optIndex)
          .map((i) => (i > optIndex ? i - 1 : i));
      } else if (newCorrect === optIndex) {
        newCorrect = 0;
      } else if (typeof newCorrect === "number" && newCorrect > optIndex) {
        newCorrect = newCorrect - 1;
      }

      const updatedQuestion: Question = {
        ...question,
        options: newOptions,
        correctAnswerIndex: newCorrect,
      };

      return prev.map((q, i) => (i === qIndex ? updatedQuestion : q));
    });
  }, []);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: uuidv4(),
        question: "",
        options: Array(4)
          .fill(null)
          .map(() => ({ text: "" })),
        correctAnswerIndex: 0,
        type: "single",
        matchPairs: [],
      },
    ]);
    scrollToBottom();
  };

  const updateQuestion = useCallback(
    (index: number, updated: Partial<Question>) => {
      flushSync(() => {
        setQuestions((prev) =>
          prev.map((q, i) => (i === index ? { ...q, ...updated } : q))
        );
      });
    },
    []
  );

  const updateOption = useCallback(
    (qIndex: number, optIndex: number, value: string) => {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === qIndex
            ? {
                ...q,
                options: q.options.map((opt, j) =>
                  j === optIndex ? { ...opt, text: value } : opt
                ),
              }
            : q
        )
      );
    },
    []
  );

  const deleteQuestion = useCallback((index: number) => {
    if (confirm("Удалить этот вопрос?")) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleSave = async () => {
    if (!poetId) {
      alert("Введите ID поэта");
      return;
    }

    const isValid = questions.every((q) => {
      if (!q.question.trim()) return false;

      if (q.type === "single" || q.type === "multiple") {
        if (q.options.length < 2 || q.options.some((opt) => !opt.text.trim()))
          return false;

        const hasCorrect =
          q.type === "multiple"
            ? Array.isArray(q.correctAnswerIndex) &&
              q.correctAnswerIndex.length > 0
            : typeof q.correctAnswerIndex === "number";

        if (!hasCorrect) return false;
      }

      if (q.type === "match") {
        if (!q.matchPairs || q.matchPairs.length === 0) return false;
        if (q.matchPairs.some((p) => !p.left.trim() || !p.right.trim()))
          return false;
      }

      if (q.type === "text") {
        if (!q.textAnswer?.answer.trim()) return false;
      }

      return true;
    });

    if (!isValid) {
      alert("Пожалуйста, убедитесь, что все вопросы корректно заполнены.");
      return;
    }

    const title = prompt("Введите название теста") || "Без названия";

    const payload = {
      title,
      poetId: poetId ? parseInt(poetId) : undefined,
      questions: questions.map((q) => {
        const base = { question: q.question, type: q.type.toUpperCase() };

        if (q.type === "single" || q.type === "multiple") {
          const correctIndexes = Array.isArray(q.correctAnswerIndex)
            ? q.correctAnswerIndex
            : [q.correctAnswerIndex];
          return {
            ...base,
            options: q.options.map((opt, index) => ({
              text: opt.text,
              isCorrect: correctIndexes.includes(index),
            })),
          };
        }

        if (q.type === "match") {
          return { ...base, matchPairs: q.matchPairs };
        }

        if (q.type === "text") {
          return { ...base, textAnswer: q.textAnswer };
        }

        return base;
      }),
    };

    const res = await fetch(`/api/admin/quizzes/${poetId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Тест сохранен успешно!");
      setQuestions([]);
    } else {
      alert("Ошибка при сохранении");
    }
  };

  if (status === "loading") {
    return <div>Загрузка...</div>;
  }

  if (!session) {
    return redirect("/not-admin");
  }

  if (session.user.role !== "ADMIN") {
    return redirect("/not-admin");
  }


  return (
    <div className="max-w-4xl mx-auto mt-24 p-8 space-y-6">
      <div className="space-y-2">
        <Label>ID поэта</Label>
        <Input
          className="bg-white rounded-xl focus-visible:ring-2 focus:ring-[#996633]"
          value={poetId}
          onChange={(e) => setPoetId(e.target.value)}
        />
      </div>

      {questions.map((q, qIndex) => (
        <QuestionItem
          key={q.id}
          q={q}
          qIndex={qIndex}
          updateQuestion={updateQuestion}
          updateOption={updateOption}
          deleteOption={deleteOption}
          deleteQuestion={deleteQuestion}
          addOption={addOption}
        />
      ))}

      <div className="flex gap-4">
        <Button className="rounded-xl" onClick={addQuestion}>
          Добавить вопрос
        </Button>
        <Button
          className="rounded-xl"
          variant="secondary"
          onClick={handleSave}
          disabled={questions.length === 0}
        >
          Сохранить тест
        </Button>
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
