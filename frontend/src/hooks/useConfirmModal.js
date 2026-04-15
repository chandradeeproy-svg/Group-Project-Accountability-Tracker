import { useState } from "react";
export const useConfirmModal = () => {
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        type: "primary",
    });
    const askConfirm = (title, message, onConfirm, type = "primary") => {
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
