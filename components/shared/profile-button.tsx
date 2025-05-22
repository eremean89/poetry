import { useSession } from "next-auth/react";
import React from "react";
import { Button } from "../ui/button";
import { CircleUser, UserRound } from "lucide-react";
import Link from "next/link";

interface Props {
  OnClickOpenModal?: () => void;
  className?: string;
}

export const ProfileButton: React.FC<Props> = ({
  className,
  OnClickOpenModal,
}) => {
  const { data: session } = useSession();

  return (
    <div className={className}>
      {session ? (
        <Link href="/profile">
          <Button variant="secondary" className="rounded-xl flex items-center gap-1">
            <CircleUser size={14} />
            Профиль
          </Button>
        </Link>
      ) : (
        <Button
          onClick={OnClickOpenModal}
          className="flex items-center gap-1 rounded-xl"
        >
          <UserRound size={14} />
          Войти
        </Button>
      )}
    </div>
  );
};
