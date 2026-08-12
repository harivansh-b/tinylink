/**
 * useRazorpay — hook for Razorpay payment checkout.
 *
 * Usage:
 *   const { pay, loading } = useRazorpay();
 *   await pay("pro");
 */

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

declare global {
    interface Window {
        Razorpay: new (opts: object) => { open(): void };
    }
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface PayResult {
    success: boolean;
    plan?: string;
    error?: string;
}

export function useRazorpay() {
    const { getToken, isSignedIn } = useAuth();
    const [loading, setLoading] = useState(false);

    const pay = useCallback(
        async (plan: string, userEmail?: string, userName?: string): Promise<PayResult> => {
            if (!isSignedIn) return { success: false, error: "Not signed in" };

            setLoading(true);
            try {
                // Always bypass Clerk's token cache for payment calls —
                // Clerk JWTs expire in ~60 s and a cached token could already
                // be stale if the page was idle.
                const freshToken = async () => getToken({ skipCache: true });

                const authHeaders = async () => ({
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await freshToken()}`,
                });

                // 1. Create order on backend
                const orderRes = await fetch(`${API_BASE}/api/payment/order`, {
                    method: "POST",
                    headers: await authHeaders(),
                    body: JSON.stringify({ plan }),
                });
                if (!orderRes.ok) {
                    const err = await orderRes.json().catch(() => ({}));
                    throw new Error((err as { detail?: string }).detail || "Failed to create order");
                }
                const order = await orderRes.json() as {
                    order_id: string; amount: number; currency: string; key_id: string;
                };

                // 2. Open Razorpay checkout modal
                const result = await new Promise<PayResult>((resolve) => {
                    const rzp = new window.Razorpay({
                        key: order.key_id,
                        amount: order.amount,
                        currency: order.currency,
                        name: "TinyLink",
                        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                        order_id: order.order_id,
                        prefill: {
                            email: userEmail || "",
                            name: userName || "",
                        },
                        theme: { color: "#6366f1" },
                        modal: {
                            ondismiss: () => resolve({ success: false, error: "Payment cancelled" }),
                        },
                        handler: async (response: {
                            razorpay_order_id: string;
                            razorpay_payment_id: string;
                            razorpay_signature: string;
                        }) => {
                            // 3. Verify on backend — re-fetch a fresh token here because
                            // the user may have spent 60+ seconds inside the payment modal
                            // and the original token will have expired.
                            try {
                                const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
                                    method: "POST",
                                    headers: await authHeaders(),
                                    body: JSON.stringify({
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                        plan,
                                    }),
                                });
                                if (!verifyRes.ok) {
                                    const err = await verifyRes.json().catch(() => ({}));
                                    resolve({ success: false, error: (err as { detail?: string }).detail || "Verification failed" });
                                } else {
                                    const data = await verifyRes.json();
                                    resolve({ success: true, plan: (data as { plan: string }).plan });
                                }
                            } catch (err) {
                                resolve({ success: false, error: String(err) });
                            }
                        },
                    });
                    rzp.open();
                });

                return result;
            } catch (err) {
                return { success: false, error: String(err) };
            } finally {
                setLoading(false);
            }
        },
        [getToken, isSignedIn]
    );

    return { pay, loading };
}
