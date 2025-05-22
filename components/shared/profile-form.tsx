"use client";

import React from "react";
import { updateUserInfo } from "@/app/actions";
import { Container } from "@/components/shared/container";
import { FormInput } from "@/components/shared/form";

import { Title } from "@/components/shared/title";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { User } from "@prisma/client";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  profileUpdateSchema,
  TProfileUpdateValues,
} from "./auth-modal/forms/schemas";
import { LogOut, Save } from "lucide-react";

interface Props {
  data: User;
}

export const ProfileForm: React.FC<Props> = ({ data }) => {
  const form = useForm<TProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: data.fullName,
      email: data.email,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: TProfileUpdateValues) => {
    try {
      await updateUserInfo({
        email: data.email,
        fullName: data.fullName,
        password: data.password,
      });

      toast.error("Данные обновлены 📝", {
        icon: "✅",
      });
    } catch {
      return toast.error("Ошибка при обновлении данных", {
        icon: "❌",
      });
    }
  };

  const onClickSignOut = () => {
    signOut({
      callbackUrl: "/",
    });
  };

  return (
    <Container className="my-20">
      <Title text="Личные данные" size="md" className="font-bold" />

      <FormProvider {...form}>
        <form
          className="flex flex-col gap-2 w-96 mt-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormInput
            className="bg-white rounded-xl focus-visible:ring-2 focus:ring-[#996633]"
            name="email"
            label="E-Mail"
          />
          <FormInput
            className="bg-white rounded-xl focus-visible:ring-2 focus:ring-[#996633]"
            name="fullName"
            label="Полное имя"

          />

          <FormInput
            className="bg-white rounded-xl focus-visible:ring-2 focus:ring-[#996633]"
            type="password"
            name="password"
            label="Новый пароль"

          />
          <FormInput
            className="bg-white rounded-xl focus-visible:ring-2 focus:ring-[#996633]"
            type="password"
            name="confirmPassword"
            label="Повторите пароль"
 
          />

          <Button
            disabled={form.formState.isSubmitting}
            className="text-base mt-4 mb-2 rounded-xl"
            type="submit"
          >
            <Save size={14} className="mr-1" />
            Сохранить
          </Button>

          <Button
            onClick={onClickSignOut}
            variant="secondary"
            disabled={form.formState.isSubmitting}
            className="text-base rounded-xl"
            type="button"
          >
            <LogOut size={14} className="mr-1 " />
            Выйти
          </Button>
        </form>
      </FormProvider>
    </Container>
  );
};
