import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link2, Wand2, Calendar, Power } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLinks } from "@/hooks/useLinks";
import { useToast } from "@/hooks/useToast";
import type { ShortLink } from "@/types";

const schema = z.object({
    originalUrl: z
        .string()
        .min(1, "URL is required")
        .url("Please enter a valid URL"),
    customAlias: z
        .string()
        .regex(/^[a-zA-Z0-9-_]*$/, "Only letters, numbers, hyphens, underscores")
        .max(32, "Alias too long")
        .optional()
        .or(z.literal("")),
    expiresAt: z.string().optional().or(z.literal("")),
    isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface EditLinkDialogProps {
    link: ShortLink;
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditLinkDialog({
    link,
    open,
    onClose,
    onSuccess,
}: EditLinkDialogProps) {
    const { updateLink, updating } = useLinks();
    const { success, error: toastError } = useToast();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            originalUrl: link.originalUrl,
            customAlias: link.shortCode,
            expiresAt: link.expiresAt
                ? new Date(link.expiresAt).toISOString().slice(0, 16)
                : "",
            isActive: link.isActive,
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                originalUrl: link.originalUrl,
                customAlias: link.shortCode,
                expiresAt: link.expiresAt
                    ? new Date(link.expiresAt).toISOString().slice(0, 16)
                    : "",
                isActive: link.isActive,
            });
        }
    }, [open, link, reset]);

    const isActive = watch("isActive");

    async function onSubmit(data: FormData) {
        try {
            await updateLink(link.id, {
                customAlias: data.customAlias || undefined,
                expiresAt: data.expiresAt || null,
                isActive: data.isActive,
            });
            success("Link updated!", "Your changes have been saved.");
            onSuccess?.();
        } catch (err) {
            toastError(
                "Failed to update link",
                err instanceof Error ? err.message : "Something went wrong."
            );
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Edit link"
            description={`Editing: ${link.shortCode}`}
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Original URL"
                    placeholder="https://example.com/very-long-url"
                    leftIcon={<Link2 size={15} />}
                    error={errors.originalUrl?.message}
                    disabled
                    {...register("originalUrl")}
                />

                <Input
                    label="Alias / Short code"
                    placeholder="my-brand-link"
                    leftIcon={<Wand2 size={15} />}
                    error={errors.customAlias?.message}
                    {...register("customAlias")}
                />

                <Input
                    label="Expiration date (optional)"
                    type="datetime-local"
                    leftIcon={<Calendar size={15} />}
                    error={errors.expiresAt?.message}
                    {...register("expiresAt")}
                />

                {/* Active toggle */}
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-2 text-sm">
                        <Power size={15} className={isActive ? "text-emerald-500" : "text-[var(--fg-muted)]"} />
                        <span className="font-medium text-[var(--fg)]">Link active</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isActive}
                            onChange={(e) => setValue("isActive", e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-[var(--bg-tertiary)] rounded-full peer peer-checked:bg-[var(--color-brand-500)] transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={updating}>
                        Save changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
