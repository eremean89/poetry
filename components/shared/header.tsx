"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Container } from "./container";
import { Button } from "../ui";
import { LibraryBig } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "./search-input";
import { useModal } from "@/app/context/modal-context";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { ProfileButton } from "./profile-button";
import { AuthModal } from "./auth-modal/auth-modal";

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  const { isModalOpen } = useModal();
  const [openAuthModal, setOpenAuthModal] = React.useState(false);

  const onClickOpenModal = () => setOpenAuthModal(true);
  const onClickCloseModal = () => setOpenAuthModal(false);

  return (
    <AnimatePresence>
      {!isModalOpen && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "border border-[#dfba8e] bg-[#f8e5cd] fixed top-0 left w-full z-50 rounded-b-xl",
            className
          )}
        >
          <Container className="flex items-center justify-between py-4">
            {/* Левая часть */}
            <div className="flex items-center gap-4">
              <Link href="/" passHref className="flex items-center space-x-1">
                <Image src="/logo.svg" alt="Logo" width={40} height={40} />
                <div>
                  <h1 className="text-2xl uppercase font-black">
                    Дневники Поэта
                  </h1>
                  <p className="text-sm text-gray-500 leading-3">
                    вторая половина XX - начало XXI века
                  </p>
                </div>
              </Link>
            </div>

            {/* Поиск */}
            <div className="mx-10 flex-1">
              <SearchInput />
            </div>

            {/* Правая часть */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-1 rounded-xl">
                    <LibraryBig size={14} /> Статьи
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent asChild align="center" sideOffset={8}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="bg-white rounded-xl shadow-md p-1"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href="/article/twentieth-century"
                        className="w-full px-2 py-1.5 rounded-xl hover:bg-gray-100 cursor-pointer focus:outline-none"
                      >
                        Особенности поэзии XX века
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/article/twenty-first-century"
                        className="w-full px-2 py-1.5 rounded-xl hover:bg-gray-100 cursor-pointer focus:outline-none"
                      >
                        Особенности поэзии XXI века
                      </Link>
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
              <AuthModal open={openAuthModal} onClose={onClickCloseModal} />
              <ProfileButton OnClickOpenModal={onClickOpenModal} />{" "}
            </div>
          </Container>
        </motion.header>
      )}
    </AnimatePresence>
  );
};
