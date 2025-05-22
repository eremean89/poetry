"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Question } from "@/app/types/quiz-types";
import React from "react";

interface Props {
  question: Question;
  index: number;
  updateQuestion: (index: number, updated: Partial<Question>) => void;
}

function QuestionMatch({ question, index, updateQuestion }: Props) {
  const matchPairs = question.matchPairs || [];

  const updatePair = (
    pairIndex: number,
    side: "left" | "right",
    value: string
  ) => {
    const updated = [...matchPairs];
    updated[pairIndex] = { ...updated[pairIndex], [side]: value };
    updateQuestion(index, { matchPairs: updated });
  };

  const deletePair = (pairIndex: number) => {
    const updated = [...matchPairs];
    updated.splice(pairIndex, 1);
    updateQuestion(index, { matchPairs: updated });
  };

  const addPair = () => {
    const updated = [...matchPairs, { left: "", right: "" }];
    updateQuestion(index, { matchPairs: updated });
  };

  return (
    <div className="space-y-2">
      {matchPairs.map((pair, pairIndex) => (
        <div key={pairIndex} className="flex gap-2 items-center">
          <Input
            className="flex-1 focus-visible:ring-2 focus:ring-[#dfba8e]"
            placeholder={`Левая часть ${pairIndex + 1}`}
            value={pair.left}
            onChange={(e) => updatePair(pairIndex, "left", e.target.value)}
          />
          <span className="text-[#996633] font-bold">—</span>
          <Input
            className="flex-1 focus-visible:ring-2 focus:ring-[#dfba8e]"
            placeholder={`Правая часть ${pairIndex + 1}`}
            value={pair.right}
            onChange={(e) => updatePair(pairIndex, "right", e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-transparent border-none rounded-full"
            onClick={() => deletePair(pairIndex)}
          >
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ))}
      <div className="w-full flex justify-center">
        <Button
          className="bg-transparent hover:bg-transparent text-[#996633] rounded-xl  ml-[-40px] px-4 py-2 text-sm"
          onClick={addPair}
        >
          + Добавить пару
        </Button>
      </div>
    </div>
  );
}

export default React.memo(QuestionMatch);
