import React from "react";
import { formLoginSchema, TFormLoginValues } from "./schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Title } from "../../title";
import { Button } from "@/components/ui/button";
import { FormInput } from "../../form";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Image from "next/image";

interface Props {
  onClose?: VoidFunction;
}

export const LoginForm: React.FC<Props> = ({ onClose }) => {
  const form = useForm<TFormLoginValues>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: TFormLoginValues) => {
    try {
      const resp = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (!resp?.ok) {
        throw Error();
      }
      onClose?.();
    } catch (error) {
      console.error("Error [LOGIN]", error);
      toast.error("Не удалось войти", {
        icon: "❌",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex justify-between items-center">
          <div className="mr-2">
            <Title text="Вход в аккаунт" size="md" className="font-bold" />
            <p className="text-gray-400">
              Введите свою почту, чтобы войти в свой аккаунт
            </p>
          </div>
          <Image
            src="/assets/images/phone-icon.png"
            alt="phone-icon"
            width={60}
            height={60}
          />
        </div>

        <FormInput
          className="bg-white rounded-xl focus-visible:ring-2 border-gray-400 focus:ring-[#996633]"
          name="email"
          label="E-Mail"
          required
        />
        <FormInput
          className="bg-white rounded-xl focus-visible:ring-2 border-gray-400 focus:ring-[#996633]"
          type="password"
          name="password"
          label="Пароль"
          required
        />

        <Button
          disabled={form.formState.isSubmitting}
          className="flex items-center gap-1 rounded-xl text-base"
          type="submit"
        >
          Войти
        </Button>
      </form>
    </FormProvider>
  );
};
