import { useState } from "react";

export type ModalType = "primary" | "danger" | "success";

interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: ModalType;
}

export const useConfirmModal = () => {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "primary",
  });

  const askConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: ModalType = "primary",
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  const closeModal = () => {
    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    confirmConfig,
    askConfirm,
    closeModal,
  };
};
