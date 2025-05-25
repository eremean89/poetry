"use client";

import React from "react";
import { Question } from "@/components/shared/types/quiz-types";
import QuestionSingle from "./questionTypes/question-single";
import QuestionMultiple from "./questionTypes/question-multiple";
import QuestionMatch from "./questionTypes/question-match";
import QuestionText from "./questionTypes/question-text";

interface Props {
  question: Question;
  index: number;
  updateQuestion: (index: number, updated: Partial<Question>) => void;
  updateOption?: (qIndex: number, optIndex: number, value: string) => void;
  deleteOption?: (qIndex: number, optIndex: number) => void;
}

export default function QuestionBlock({
  question,
  index,
  updateQuestion,
  updateOption,
  deleteOption,
}: Props) {
  switch (question.type) {
    case "single":
      return (
        <QuestionSingle
          question={question}
          index={index}
          updateQuestion={updateQuestion}
          updateOption={updateOption!} 
          deleteOption={deleteOption!}
        />
      );
    case "multiple":
      return (
        <QuestionMultiple
          question={question}
          index={index}
          updateQuestion={updateQuestion}
          updateOption={updateOption!}
          deleteOption={deleteOption!}
        />
      );
    case "match":
      return (
        <QuestionMatch
          question={question}
          index={index}
          updateQuestion={updateQuestion}
        />
      );
    case "text":
      return (
        <QuestionText
          question={question}
          index={index}
          updateQuestion={updateQuestion}
        />
      );
    default:
      return <p>Неизвестный тип вопроса</p>;
  }
}
