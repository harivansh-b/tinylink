import { useCallback, useState } from "react";
import { copyToClipboard } from "@/utils";

export function useClipboard(resetDelay = 2000) {
    const [copied, setCopied] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copy = useCallback(
        async (text: string, id?: string) => {
            const success = await copyToClipboard(text);
            if (success) {
                setCopied(true);
                if (id) setCopiedId(id);
                setTimeout(() => {
                    setCopied(false);
                    setCopiedId(null);
                }, resetDelay);
            }
            return success;
        },
        [resetDelay]
    );

    const isCopied = useCallback(
        (id?: string) => {
            if (id) return copiedId === id;
            return copied;
        },
        [copied, copiedId]
    );

    return { copy, copied, copiedId, isCopied };
}
