"use client";

import { useEffect, useState, useReducer, useCallback, useMemo } from "react";
import { redirect, useParams } from "next/navigation";
import {
  Question,
  Answer,
  ServerQuestion,
  MatchPair,
} from "@/app/types/quiz-types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";

type AnswersAction =
  | { type: "setAnswer"; questionId: string; answer: Answer }
  | { type: "reset" };

const answersReducer = (
  state: Record<string, Answer>,
  action: AnswersAction
) => {
  switch (action.type) {
    case "setAnswer":
      return { ...state, [action.questionId]: action.answer };
    case "reset":
      return {};
    default:
      return state;
  }
};

interface DetailedResult {
  questionId: number;
  isCorrect: boolean;
  correctAnswer: {
    type: string;
    correctIndexes: number[];
    correctText: string | null;
    correctPairs: MatchPair[];
  };
}

export default function QuizPage() {
  const { id } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [showDetails, setShowDetails] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    detailedResults: DetailedResult[];
  } | null>(null);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, dispatch] = useReducer(answersReducer, {});
  const { data: session, status } = useSession();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleMatchChange = useCallback(
    (questionId: string) => (left: string[], right: string[]) => {
      dispatch({
        type: "setAnswer",
        questionId,
        answer: {
          type: "match",
          questionId,
          pairs: left.map((l, i) => ({ left: l, right: right[i] })),
        },
      });
    },
    []
  );

  useEffect(() => {
    if (!id) return;
    fetch(`/api/user/quiz/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          const formatted: Question[] = data.questions.map(
            (q: ServerQuestion) => ({
              id: String(q.id),
              question: q.question,
              type: q.type.toLowerCase() as Question["type"],
              options: q.options?.map((o) => ({ text: o.text })) ?? [],
              matchPairs: q.matchPairs,
              textAnswer: q.textAnswer,
            })
          );
          setQuestions(formatted);
          setTitle(data.title);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Ошибка при загрузке викторины");
        setLoading(false);
      });
  }, [id]);

  if (status === "loading") {
    return <div>Загрузка...</div>;
  }
  if (!session) {
    return redirect("/not-auth");
  }

  const handleSubmit = async () => {
    const allAnswered = questions.every((q) => {
      const a = answers[q.id];
      if (!a) return false;
      switch (q.type) {
        case "single":
          return a.type === "single" && a.selectedIndex != null;
        case "multiple":
          return a.type === "multiple" && a.selectedIndexes.length > 0;
        case "text":
          return a.type === "text" && a.text.trim() !== "";
        case "match":
          return (
            a.type === "match" &&
            Array.isArray(a.pairs) &&
            a.pairs.length === (q.matchPairs?.length || 0)
          );
      }
      return false;
    });
    if (!allAnswered) {
      toast.warning("Ответьте на все вопросы", {
        style: { fontSize: "14px", padding: "12px" },
      });
      return;
    }

    try {
      const res = await fetch(`/api/user/quiz/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      setResult({
        score: data.score,
        total: data.total,
        detailedResults: data.detailedResults,
      });
      setOpen(true);
    } catch {
      toast.error("Ошибка при отправке ответов", {
        style: { fontSize: "16px", padding: "12px" },
      });
    }
  };

  if (loading) return <p className="text-center mt-32">Загрузка…</p>;
  if (error) return <p className="text-center mt-32 text-red-500">{error}</p>;

  return (
    <>
      <Toaster richColors position="bottom-right" duration={2000} />
      <section className="max-w-3xl mx-auto p-6 mt-28 bg-white rounded-2xl shadow space-y-5">
        <h1 className="text-3xl font-bold text-center">{title}</h1>

        {questions.map((q, i) => {
          const dr = showDetails
            ? result?.detailedResults.find((r) => String(r.questionId) === q.id)
            : undefined;

          const cardClass = dr
            ? dr.isCorrect
              ? "border-green-400 bg-green-50"
              : "border-red-400 bg-red-50"
            : "";

          return (
            <Card key={q.id} className={cn("p-4", cardClass)}>
              <h3 className="font-bold mb-1 whitespace-pre-wrap leading-relaxed">
                {i + 1}. {q.question}
              </h3>

              {/* single */}
              {q.type === "single" && (
                <RadioGroup
                  onValueChange={(v) =>
                    dispatch({
                      type: "setAnswer",
                      questionId: q.id,
                      answer: {
                        type: "single",
                        questionId: q.id,
                        selectedIndex: Number(v),
                      },
                    })
                  }
                >
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2 -m-1">
                      <RadioGroupItem
                        value={String(idx)}
                        id={`${q.id}-${idx}`}
                        className="border border-[#996633] bg-transparent data-[state=checked]:bg-[#996633] data-[state=checked]:text-white data-[state=checked]:border-[#996633] transition-colors"
                      />
                      <label htmlFor={`${q.id}-${idx}`}>{opt.text}</label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* multiple */}
              {q.type === "multiple" && (
                <div>
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${q.id}-${idx}`}
                        onCheckedChange={(ch) => {
                          const prev =
                            (
                              answers[q.id] as {
                                type: "multiple";
                                selectedIndexes: number[];
                              }
                            )?.selectedIndexes || [];
                          const set = new Set(prev);
                          if (ch) set.add(idx);
                          else set.delete(idx);
                          dispatch({
                            type: "setAnswer",
                            questionId: q.id,
                            answer: {
                              type: "multiple",
                              questionId: q.id,
                              selectedIndexes: Array.from(set),
                            },
                          });
                        }}
                        className="border border-[#996633] bg-transparent data-[state=checked]:bg-[#996633] data-[state=checked]:text-white data-[state=checked]:border-[#996633] rounded-md transition-colors"
                      />
                      <label htmlFor={`${q.id}-${idx}`}>{opt.text}</label>
                    </div>
                  ))}
                </div>
              )}

              {/* text */}
              {q.type === "text" && (
                <Input
                  placeholder="Ваш ответ"
                  onChange={(e) =>
                    dispatch({
                      type: "setAnswer",
                      questionId: q.id,
                      answer: {
                        type: "text",
                        questionId: q.id,
                        text: e.target.value,
                      },
                    })
                  }
                  className="flex-grow focus-visible:ring-2 rounded-xl focus:ring-[#996633]"
                />
              )}

              {/* match */}
              {q.type === "match" && q.matchPairs && (
                <MatchQuestion
                  pairs={q.matchPairs}
                  sensors={sensors}
                  onChange={handleMatchChange(q.id)}
                />
              )}
            </Card>
          );
        })}

        <div className="text-center space-x-4">
          <Button
            onClick={handleSubmit}
            className="bg-[#996633] rounded-2xl text-white"
          >
            Завершить
          </Button>
        </div>
        {/* модалка с итогом */}
        <Dialog open={open} onOpenChange={(next) => next && setOpen(true)}>
          <DialogContent
            className="rounded-2xl border border-gray-300 shadow-xl bg-white pt-10"
            onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DialogHeader className="mt-2">
                <DialogTitle className="text-2xl text-primary font-bold text-center">
                  Ваш результат
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4 text-center">
                {result ? (
                  <>
                    <div className="w-full max-w-xs mx-auto">
                      <p>
                        <strong className="text-primary">Правильных:</strong>{" "}
                        {result.score} из {result.total}
                      </p>
                      <p>{Math.round((result.score / result.total) * 100)}%</p>
                      <Progress
                        className="w-full"
                        value={(result.score / result.total) * 100}
                        max={100}
                      />
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                      {/* Кнопка “Вернуться к поэту” */}
                      <Button
                        variant="ghost"
                        className="bg-transparent hover:bg-transparent text-[#996633] py-2 px-2 rounded-xl gap-2"
                        onClick={() => (window.location.href = `/poet/${id}`)}
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Вернуться к поэту
                      </Button>
                      {/* Кнопка “Показать ответы” */}
                      {!!result && (
                        <Button
                          variant="ghost"
                          className="bg-transparent hover:bg-transparent text-[#996633] py-2 px-2 rounded-xl gap-2"
                          onClick={() => {
                            setShowDetails(true);
                            setOpen(false);
                          }}
                        >
                          Показать ответы
                        </Button>
                      )}
                      {/* Кнопка “Пройти заново” */}
                      <Button
                        variant="ghost"
                        className="bg-transparent hover:bg-transparent text-[#996633] py-2 px-2 rounded-xl gap-2"
                        onClick={() => window.location.reload()}
                      >
                        <RotateCcw className="w-5 h-5" />
                        Пройти ещё раз
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-red-500">Результаты не доступны</p>
                )}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
}

function MatchQuestion({
  pairs,
  sensors,
  onChange,
}: {
  pairs: MatchPair[];
  sensors: ReturnType<typeof useSensors>;
  onChange: (left: string[], right: string[]) => void;
}) {
  const shuffleArray = (array: string[]) => {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const leftItems = useMemo<{ id: string; text: string }[]>(
    () => pairs.map((p, i) => ({ id: `l-${i}`, text: p.left })),
    [pairs]
  );
  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>(
    () =>
      shuffleArray(pairs.map((p) => p.right)).map((text, i) => ({
        id: `r-${i}`,
        text,
      }))
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const update = (
      items: { id: string; text: string }[],
      setItems: React.Dispatch<
        React.SetStateAction<{ id: string; text: string }[]>
      >
    ) => {
      const from = items.findIndex((i) => i.id === active.id);
      const to = items.findIndex((i) => i.id === over.id);
      if (from >= 0 && to >= 0) {
        const newItems = arrayMove(items, from, to);
        setItems(newItems);
        onChange(
          leftItems.map((i) => i.text),
          newItems.map((i) => i.text)
        );
      }
    };
    if (String(active.id).startsWith("r-")) {
      update(rightItems, setRightItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 gap-4">
        <SortableContext
          items={leftItems.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {leftItems.map((item) => (
              <li
                key={item.id}
                className="p-2 bg-muted rounded-2xl border border-[#996633]"
              >
                {item.text}
              </li>
            ))}
          </ul>
        </SortableContext>
        <SortableContext
          items={rightItems.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {rightItems.map((item) => (
              <SortableItem key={item.id} id={item.id} text={item.text} />
            ))}
          </ul>
        </SortableContext>
      </div>
    </DndContext>
  );
}

function SortableItem({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "p-2 bg-muted rounded-2xl border border-[#996633] cursor-move"
      )}
    >
      {text}
    </li>
  );
}
