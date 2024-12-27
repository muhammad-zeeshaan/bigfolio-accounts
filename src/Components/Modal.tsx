"use client";
import React from "react";
import { Modal as AntdModal } from "antd";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    onOk?: () => void;
    onCancel?: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, onOk }) => {
    return (
        <AntdModal
            title={title || ""}
            open={isOpen}
            onCancel={onClose}
            onOk={onOk}
            footer={null}
            closable={true}
            destroyOnClose={true}
            maskClosable={true}
            width={800}
        >
            {children}
        </AntdModal>
    );
};

export default Modal;
