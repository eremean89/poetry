"use client";

import { Button } from "@/components/ui/button";

import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TFormRegisterValues, formRegisterSchema } from "./schemas";
import { FormInput } from "@/components/shared/form";
import { registerUser } from "@/app/actions";
import { toast } from "sonner";
import { Title } from "../../title";

interface Props {
  onClose?: VoidFunction;
  onClickLogin?: VoidFunction;
}

export const RegisterForm: React.FC<Props> = ({ onClose }) => {
  const form = useForm<TFormRegisterValues>({
    resolver: zodResolver(formRegisterSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: TFormRegisterValues) => {
    try {
      await registerUser({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });

      toast.error("Регистрация успешна 📝. Подтвердите свою почту", {
        icon: "✅",
      });

      onClose?.();
    } catch {
      return toast.error("Неверный E-Mail или пароль", {
        icon: "❌",
      });
    }
  };

  console.log(form.formState);

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="mr-2">
          <Title text="Регистрация" size="md" className="font-bold" />
          <p className="text-gray-400">
            Введите данные для регистрации
          </p>
        </div>
        <FormInput
          className="bg-white rounded-xl focus-visible:ring-2 border-gray-400 focus:ring-[#996633]"
          name="email"
          label="E-Mail"
          required
        />
        <FormInput
          className="bg-white rounded-xl focus-visible:ring-2 border-gray-400 focus:ring-[#996633]"
          name="fullName"
          label="Полное имя"
          required
        />
        <FormInput
          className="bg-white rounded-xl focus-visible:ring-2 border-gray-400 focus:ring-[#996633]"
          name="password"
          label="Пароль"
          type="password"
          required
        />
        <FormInput
          className="bg-white rounded-xl focus-visible:ring-2 border-gray-400 focus:ring-[#996633]"
          name="confirmPassword"
          label="Подтвердите пароль"
          type="password"
          required
        />

        <Button
          loading={form.formState.isSubmitting}
          className="flex items-center gap-1 rounded-xl text-base"
          type="submit"
        >
          Зарегистрироваться
        </Button>
      </form>
    </FormProvider>
  );
};
