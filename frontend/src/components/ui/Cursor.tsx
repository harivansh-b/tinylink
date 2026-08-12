import { useEffect, useRef, useState } from "react";

/**
 * PremiumCursor — desktop-only custom cursor.
 * - A 5px filled dot that follows exactly.
 * - A 32px ring that smoothly interpolates (lags ~120ms behind).
 * - Ring expands on hover of interactive elements, contracts on click.
 * - Entirely disabled on touch devices and with prefers-reduced-motion.
 */
export function PremiumCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    const [visible, setVisible] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [clicking, setClicking] = useState(false);

    useEffect(() => {
        // Bail out on touch-only devices or reduced motion
        if (
            window.matchMedia("(pointer: coarse)").matches ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        let mouseX = -100, mouseY = -100;
        let ringX = -100, ringY = -100;
        let rafId: number;

        // Dot follows exactly
        const onMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
            if (!visible) setVisible(true);
        };

        // Ring smoothly interpolates
        const tick = () => {
            ringX += (mouseX - ringX) * 0.14;
            ringY += (mouseY - ringY) * 0.14;
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        // Detect hoverable elements
        const SELECTORS = "a, button, [role='button'], input, textarea, select, label, [data-cursor-hover]";

        const onOver = (e: MouseEvent) => {
            if ((e.target as Element)?.closest(SELECTORS)) setHovering(true);
        };
        const onOut = (e: MouseEvent) => {
            if (!(e.target as Element)?.closest(SELECTORS)) setHovering(false);
        };
        const onDown = () => setClicking(true);
        const onUp = () => setClicking(false);

        const onLeave = () => setVisible(false);
        const onEnter = () => setVisible(true);

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseover", onOver, { passive: true });
        window.addEventListener("mouseout", onOut, { passive: true });
        window.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);
        document.documentElement.addEventListener("mouseleave", onLeave);
        document.documentElement.addEventListener("mouseenter", onEnter);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mouseout", onOut);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
            document.documentElement.removeEventListener("mouseleave", onLeave);
            document.documentElement.removeEventListener("mouseenter", onEnter);
        };
    }, [visible]);

    return (
        <>
            <div
                ref={dotRef}
                className="cursor-dot"
                style={{ opacity: visible ? 1 : 0 }}
            />
            <div
                ref={ringRef}
                className={[
                    "cursor-ring",
                    hovering ? "is-hovering" : "",
                    clicking ? "is-clicking" : "",
                ].join(" ")}
                style={{ opacity: visible ? 1 : 0 }}
            />
        </>
    );
}
