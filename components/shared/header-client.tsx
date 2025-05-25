
"use client";

import { usePathname } from "next/navigation";
import { useModal } from "@/components/shared/context/modal-context";
import { Header } from "./header";

export default function HeaderClient() {
  const pathname = usePathname();
  const { isModalOpen } = useModal();

  const show = !isModalOpen || pathname.startsWith("/user/quiz");

  if (!show) return null;
  return <Header />;
}
