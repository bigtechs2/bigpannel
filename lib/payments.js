class Payments {
    constructor(config) {
        this.config = config;
    }

    async createInvoice(amount, currency, plan, userId) {
        return {
            id: `INV-${Date.now()}-${userId}`,
            amount: amount,
            currency: currency,
            plan: plan,
            userId: userId,
            status: 'pending',
            createdAt: Date.now()
        };
    }

    async verifyPayment(invoiceId, transactionData) {
        // For manual verification, we just return verified true
        // In production, you would check with a payment gateway API
        return {
            verified: true,
            transactionId: transactionData?.transactionId || 'MANUAL-' + Date.now()
        };
    }

    // ── Generate payment message ──
    getPaymentInstructions(plan, details) {
        return (
            ` *Manual Payment Instructions*\n\n` +
            `*Plan:* ${plan.name}\n` +
            `*Amount:* ${plan.price.toLocaleString()} ${plan.currency}\n\n` +
            `*Send payment to:*\n` +
            `${details}\n\n` +
            `*After payment:*\n` +
            `1. Send payment screenshot\n` +
            `2. Type /confirm_payment\n\n` +
            `_Payment will be verified within 5 minutes._`
        );
    }

    // ── Crypto payment instructions ──
    getCryptoInstructions(plan) {
        return (
            `» *Crypto Payment*\n\n` +
            `*Plan:* ${plan.name}\n` +
            `*Amount:* ${plan.price.toLocaleString()} ${plan.currency}\n\n` +
            `Send USDT (TRC20) or BTC to the address below:\n\n` +
            `• USDT (TRC20): TXXX...\n` +
            `• BTC: 1XXX...\n\n` +
            `Send payment confirmation to proceed.`
        );
    }
}

module.exports = Payments;