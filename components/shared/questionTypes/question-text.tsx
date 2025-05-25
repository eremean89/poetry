"use client";
import { Input } from "@/components/ui/input";
import { Question } from "@/components/shared/types/quiz-types";
import React from "react";

interface Props {
  question: Question;
  index: number;
  updateQuestion: (index: number, updated: Partial<Question>) => void;
}

function QuestionText({ question, index, updateQuestion }: Props) {
  return (
    <div className="space-y-4">
      <Input
        className="focus-visible:ring-2 focus:ring-[#dfba8e]"
        placeholder="Введите правильный ответ"
        value={question.textAnswer?.answer || ""}
        onChange={(e) =>
          updateQuestion(index, {
            textAnswer: {
              answer: e.target.value,
            },
          })
        }
      />
    </div>
  );
}
export default React.memo(QuestionText);
