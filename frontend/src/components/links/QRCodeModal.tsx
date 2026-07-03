import { useEffect, useRef } from "react";
import { Download, Copy, Check } from "lucide-react";
import * as QRCode from "qrcode";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useClipboard } from "@/hooks/useClipboard";
import { useToast } from "@/hooks/useToast";
import type { ShortLink } from "@/types";

interface QRCodeModalProps {
    link: ShortLink;
    open: boolean;
    onClose: () => void;
}

export function QRCodeModal({ link, open, onClose }: QRCodeModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { copy, copied } = useClipboard();
    const { success } = useToast();

    const shortUrl = link.shortUrl;

    useEffect(() => {
        if (open && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, shortUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            }).catch(console.error);
        }
    }, [open, shortUrl]);

    function handleDownload() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `qr-${shortUrl.split("/").pop()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    async function handleCopy() {
        await copy(shortUrl);
        success("Copied!", shortUrl);
    }

    return (
        <Modal open={open} onClose={onClose} title="QR Code" size="sm">
            <div className="flex flex-col items-center gap-5">
                <div className="p-3 bg-white rounded-xl">
                    <canvas ref={canvasRef} />
                </div>

                <div className="w-full p-3 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--color-brand-500)] truncate">
                        {shortUrl}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors shrink-0"
                        aria-label="Copy URL"
                    >
                        {copied ? (
                            <Check size={15} className="text-emerald-500" />
                        ) : (
                            <Copy size={15} />
                        )}
                    </button>
                </div>

                <div className="flex gap-3 w-full">
                    <Button
                        variant="secondary"
                        fullWidth
                        leftIcon={<Download size={15} />}
                        onClick={handleDownload}
                    >
                        Download PNG
                    </Button>
                    <Button
                        fullWidth
                        onClick={handleCopy}
                        leftIcon={
                            copied ? <Check size={15} /> : <Copy size={15} />
                        }
                    >
                        {copied ? "Copied!" : "Copy URL"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
