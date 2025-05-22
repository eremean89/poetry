import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Question } from "@/app/types/quiz-types";
import { X } from "lucide-react";
import React from "react";

interface Props {
  question: Question;
  index: number;
  updateQuestion: (index: number, updated: Partial<Question>) => void;
  updateOption: (qIndex: number, optIndex: number, value: string) => void;
  deleteOption: (qIndex: number, optIndex: number) => void;
}

function QuestionSingle({
  question,
  index,
  updateQuestion,
  updateOption,
  deleteOption,
}: Props) {
  return (
    <>
      {question.options.map((opt, optIndex) => (
        <div key={optIndex} className="flex items-center gap-2">
          <Checkbox
            className="border border-[#996633] bg-transparent data-[state=checked]:bg-[#996633] data-[state=checked]:text-white data-[state=checked]:border-[#996633] rounded-md transition-colors"
            checked={question.correctAnswerIndex === optIndex}
            onCheckedChange={() =>
              updateQuestion(index, { correctAnswerIndex: optIndex })
            }
          />
          <Input
            className="flex-grow focus-visible:ring-2 focus:ring-[#dfba8e]"
            placeholder={`Вариант ${optIndex + 1}`}
            value={opt.text}
            onChange={(e) => updateOption(index, optIndex, e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-transparent border-none rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              deleteOption(index, optIndex);
            }}
          >
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ))}
    </>
  );
}

export default React.memo(QuestionSingle);
