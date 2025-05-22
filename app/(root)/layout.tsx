import { ModalContextProvider } from "../context/modal-context";
import { Metadata } from "next";
import HeaderClient from "@/components/shared/header-client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Дневники Поэта",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <ModalContextProvider>
        <Suspense>
          <HeaderClient />
        </Suspense>
        {children}
      </ModalContextProvider>
    </main>
  );
}
