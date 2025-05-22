import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(6, { message: "Введите корректный пароль" });

export const formLoginSchema = z.object({
  email: z.string().email({ message: "Введите почту" }),
  password: passwordSchema,
});

export const formRegisterSchema = formLoginSchema
  .merge(
    z.object({
      fullName: z.string().min(2, { message: "Введите имя" }),
      confirmPassword: passwordSchema,
    })
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z
  .object({
    fullName: z.string().min(2, { message: "Введите имя" }),
    email: z.string().email({ message: "Введите почту" }),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      if (data.password !== undefined || data.confirmPassword !== undefined) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Пароли не совпадают",
      path: ["confirmPassword"],
    }
  );

export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>;
export type TProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
