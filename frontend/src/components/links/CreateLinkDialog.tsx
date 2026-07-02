import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link2, Wand2, Calendar } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLinks } from "@/hooks/useLinks";
import { useToast } from "@/hooks/useToast";

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
});

type FormData = z.infer<typeof schema>;

interface CreateLinkDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateLinkDialog({
    open,
    onClose,
    onSuccess,
}: CreateLinkDialogProps) {
    const { createLink, creating } = useLinks();
    const { success, error: toastError } = useToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    async function onSubmit(data: FormData) {
        try {
            await createLink({
                originalUrl: data.originalUrl,
                customAlias: data.customAlias || undefined,
                expiresAt: data.expiresAt || undefined,
            });
            success("Link created!", "Your short link is ready to share.");
            onClose();
            onSuccess?.();
        } catch (err) {
            toastError(
                "Failed to create link",
                err instanceof Error ? err.message : "Something went wrong."
            );
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create short link"
            description="Shorten a long URL into a shareable link."
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Original URL"
                    placeholder="https://example.com/very-long-url"
                    leftIcon={<Link2 size={15} />}
                    error={errors.originalUrl?.message}
                    {...register("originalUrl")}
                />

                <Input
                    label="Custom alias (optional)"
                    placeholder="my-brand-link"
                    leftIcon={<Wand2 size={15} />}
                    hint="Leave blank to auto-generate"
                    error={errors.customAlias?.message}
                    {...register("customAlias")}
                />

                <Input
                    label="Expiration date (optional)"
                    type="datetime-local"
                    leftIcon={<Calendar size={15} />}
                    hint="Link will stop working after this date"
                    error={errors.expiresAt?.message}
                    {...register("expiresAt")}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={creating}>
                        Create link
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
