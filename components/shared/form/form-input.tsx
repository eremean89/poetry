"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { RequiredSymbol } from "../required-symbol";
import { Input } from "@/components/ui/input";
import { ClearButton } from "../clear-button";
import { ErrorText } from "../error-text";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  required?: boolean;
  wrapperClassName?: string;
  inputClassName?: string;
}

export const FormInput: React.FC<Props> = ({
  wrapperClassName,
  inputClassName,
  name,
  label,
  required,
  ...props
}) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const errorText = errors?.[name]?.message as string;
  const text = watch(name);

  const onClickClear = () => {
    setValue(name, "", { shouldValidate: true });
  };

  return (
    <div className={wrapperClassName}>
      {label && (
        <p className="font-medium mb-2">
          {label} {required && <RequiredSymbol />}
        </p>
      )}

      <div className="relative">
        <Input
          className={`h-12 text-md ${inputClassName ?? ""}`}
          {...register(name)}
          {...props}
        />

        {Boolean(text) && <ClearButton onClick={onClickClear} />}
      </div>

      {errorText && <ErrorText text={errorText} />}
    </div>
  );
};
