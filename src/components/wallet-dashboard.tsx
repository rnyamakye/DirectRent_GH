"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Transaction = {
    id: string;
    type: "credit" | "debit";
    amount_pesewas: number;
    reference: string;
    description: string;
    created_at: string;
};

type PaymentMethod = {
    id: string;
    label: string;
    type: string;
};

export function WalletDashboard() {
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [showWithdraw, setShowWithdraw] = useState(false);
    
    // Withdraw form state
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load wallet balance
            const { data: wallet } = await supabase
                .from("wallets")
                .select("id, balance_pesewas")
                .eq("user_id", user.id)
                .single();

            if (wallet) {
                setBalance(wallet.balance_pesewas);
                
                // Load transactions
                const { data: txns } = await supabase
                    .from("wallet_transactions")
                    .select("*")
                    .eq("wallet_id", wallet.id)
                    .order("created_at", { ascending: false });
                
                setTransactions(txns || []);
            }

            // Load payment methods
            const { data: methods } = await supabase
                .from("payment_methods")
                .select("id, label, type")
                .eq("user_id", user.id);
            
            setPaymentMethods(methods || []);
            if (methods && methods.length > 0) {
                setSelectedMethod(methods[0].id);
            }

            setLoading(false);
        }
        loadData();
    }, []);

    async function handleWithdraw(e: React.FormEvent) {
        e.preventDefault();
        const amountGhs = parseFloat(withdrawAmount);
        if (isNaN(amountGhs) || amountGhs <= 0) {
            toast.error("Invalid amount.");
            return;
        }

        if (amountGhs * 100 > balance) {
            toast.error("Insufficient balance.");
            return;
        }

        if (!selectedMethod) {
            toast.error("Select a payment method.");
            return;
        }

        setSubmitting(true);
        const res = await fetch("/api/wallet/payout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amountGhs, paymentMethodId: selectedMethod, notes: "Requested via dashboard" }),
        });

        const data = await res.json();
        setSubmitting(false);

        if (!res.ok) {
            toast.error(data.error || "Failed to process withdrawal.");
            return;
        }

        toast.success("Withdrawal requested successfully!");
        setShowWithdraw(false);
        setBalance(data.newBalance);
        setWithdrawAmount("");
        
        // Optimistically add transaction
        setTransactions([
            {
                id: crypto.randomUUID(),
                type: "debit",
                amount_pesewas: amountGhs * 100,
                reference: "pending",
                description: "Withdrawal request",
                created_at: new Date().toISOString(),
            },
            ...transactions
        ]);
    }

    if (loading) {
        return <div className="py-24 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-heading">Wallet & Earnings</h1>
            
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div>
                    <p className="text-sm font-semibold text-body/60 uppercase tracking-wider mb-1">Available Balance</p>
                    <h2 className="text-4xl font-extrabold text-heading">GHS {(balance / 100).toFixed(2)}</h2>
                </div>
                <button
                    onClick={() => setShowWithdraw(!showWithdraw)}
                    className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 font-bold transition shadow-sm"
                >
                    Withdraw Funds
                </button>
            </div>

            {showWithdraw && (
                <form onSubmit={handleWithdraw} className="bg-slate-50 border border-border rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-bold">Request Withdrawal</h3>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-heading">Amount (GHS)</label>
                        <input
                            type="number"
                            step="0.01"
                            max={balance / 100}
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-heading">Withdraw to</label>
                        {paymentMethods.length === 0 ? (
                            <p className="text-sm text-accent">You have no saved payment methods. Go to Payments to add one.</p>
                        ) : (
                            <select
                                value={selectedMethod}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary"
                            >
                                {paymentMethods.map(m => (
                                    <option key={m.id} value={m.id}>{m.label} ({m.type.replace('_', ' ')})</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={submitting || paymentMethods.length === 0} className="bg-primary hover:bg-primary-hover text-white rounded-xl px-5 py-2.5 font-bold disabled:opacity-50 transition">
                            {submitting ? "Processing..." : "Confirm"}
                        </button>
                        <button type="button" onClick={() => setShowWithdraw(false)} className="bg-transparent border border-border text-heading rounded-xl px-5 py-2.5 font-bold hover:bg-slate-100 transition">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold text-heading">Transaction History</h3>
                
                {transactions.length === 0 ? (
                    <div className="rounded-3xl border border-border bg-card p-12 text-center text-body/60">
                        No transactions yet.
                    </div>
                ) : (
                    <div className="rounded-3xl border border-border bg-card overflow-hidden divide-y divide-border">
                        {transactions.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-5">
                                <div className="flex flex-col gap-1">
                                    <p className="font-semibold text-heading">{t.description}</p>
                                    <p className="text-xs text-body/60">{new Date(t.created_at).toLocaleDateString()} · Ref: {t.reference}</p>
                                </div>
                                <div className={`font-bold ${t.type === 'credit' ? 'text-primary' : 'text-heading'}`}>
                                    {t.type === 'credit' ? '+' : '-'}GHS {(t.amount_pesewas / 100).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
