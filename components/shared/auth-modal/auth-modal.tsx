import { Button } from "@/components/ui";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import { LoginForm } from "./forms/login-form";
import { RegisterForm } from "./forms/register-form";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ open, onClose }) => {
  const [type, setType] = React.useState<"login" | "register">("login");
  const onSwitchType = () => {
    setType(type === "login" ? "register" : "login");
  };
  const handleClose = () => {
    onClose();
    setType("login");
  };
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[450px] bg-white p-10">
        {type === "login" ? (
          <LoginForm onClose={handleClose} />
        ) : (
          <RegisterForm onClose={handleClose} />
        )}
        <Button
          variant="outline"
          onClick={onSwitchType}
          type="button"
          className="flex items-center gap-1 rounded-xl text-base bg-transparent text-[#996633] border-[#996633]"
        >
          <DialogTitle className="text-base font-semibold">
            {type !== "login" ? "Вход" : "Регистрация"}
          </DialogTitle>
        </Button>
      </DialogContent>
    </Dialog>
  );
};
