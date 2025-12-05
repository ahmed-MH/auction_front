import React, { useState } from "react";
import API_BASE_URL from "../config";
import { X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51SZF9gRGlF6gfv1ZUMQSu9vbHe4yT9nmeYPo68kSBcXJ9Jzla6K3ChkVGYVaWXDGxbTQcgNdM4Bux2AZ6FqRjBdO008NiowEIY");

const CheckoutForm = ({ user, onClose, onCreditsUpdated }) => {
    const stripe = useStripe();
    const elements = useElements();

    // Stripe minimum is $0.50 USD (assuming 1 credit = $1, min is 1 credit)
    // For safety, we'll use 1 credit minimum and 10,000 credits maximum
    const MIN_CREDITS = 1;
    const MAX_CREDITS = 900000;

    const [credits, setCredits] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validationError, setValidationError] = useState("");

    // Validate credits in real-time
    const handleCreditsChange = (value) => {
        const numValue = Number(value);
        setCredits(numValue);

        // Clear previous validation errors
        setValidationError("");
        setError("");

        if (value === "" || numValue === 0) {
            setValidationError("");
        } else if (numValue < MIN_CREDITS) {
            setValidationError(`Minimum ${MIN_CREDITS} credit required`);
        } else if (numValue > MAX_CREDITS) {
            setValidationError(`Maximum ${MAX_CREDITS} credits allowed`);
        } else if (!Number.isInteger(numValue)) {
            setValidationError("Please enter a whole number");
        }
    };

    const isValidAmount = () => {
        return credits >= MIN_CREDITS &&
            credits <= MAX_CREDITS &&
            Number.isInteger(credits);
    };

    const handlePayment = async () => {
        // Final validation before payment
        if (!isValidAmount()) {
            setError(`Please enter a valid amount between ${MIN_CREDITS} and ${MAX_CREDITS} credits`);
            return;
        }

        setLoading(true);
        setError("");

        try {
            // 1️⃣ Créer PaymentIntent côté backend
            const res = await fetch(`${API_BASE_URL}/api/payment/create-intent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({ montant: credits }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Erreur lors de la création du paiement");
            }

            const { clientSecret, paymentIntentId } = await res.json();

            // 2️⃣ Confirmer le paiement avec Stripe
            const card = elements.getElement(CardElement);
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card },
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (result.paymentIntent.status !== "succeeded") {
                throw new Error("Le paiement n'a pas été effectué avec succès");
            }

            // 3️⃣ Confirmer le paiement côté backend pour créditer l'utilisateur
            const confirmRes = await fetch(`${API_BASE_URL}/api/payment/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({ paymentIntentId: result.paymentIntent.id })
            });

            if (!confirmRes.ok) {
                const text = await confirmRes.text();
                throw new Error(text || "Impossible de créditer les crédits");
            }

            const updatedUser = await confirmRes.json();
            onCreditsUpdated(updatedUser); // Pass entire user object
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || "Le paiement a échoué. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="font-semibold text-gray-700 block mb-2">
                    Credit Amount
                </label>
                <input
                    type="number"
                    value={credits}
                    onChange={(e) => handleCreditsChange(e.target.value)}
                    className={`w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all ${validationError
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-orange-200'
                        }`}
                    min={MIN_CREDITS}
                    max={MAX_CREDITS}
                    step="1"
                    placeholder={`Enter amount (${MIN_CREDITS}-${MAX_CREDITS})`}
                />

                {/* Validation feedback */}
                {validationError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {validationError}
                    </p>
                )}

                {/* Helper text */}
                {!validationError && (
                    <p className="text-gray-500 text-xs mt-2">
                        Min: {MIN_CREDITS} credit • Max: {MAX_CREDITS} credits • Total: ${credits.toLocaleString()} USD
                    </p>
                )}
            </div>

            <div>
                <label className="font-semibold text-gray-700 block mb-2">
                    Card Information
                </label>
                <div className="p-4 border border-gray-300 rounded-lg focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }} />
                </div>
            </div>

            {/* Payment error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm flex items-start">
                        <span className="mr-2 mt-0.5">❌</span>
                        <span>{error}</span>
                    </p>
                </div>
            )}

            {/* Payment button */}
            <button
                onClick={handlePayment}
                disabled={!stripe || loading || !isValidAmount()}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${!stripe || loading || !isValidAmount()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                    </span>
                ) : (
                    `Pay $${credits.toLocaleString()} USD (${credits} Credits)`
                )}
            </button>
        </div>
    );
};

const BuyCreditsModal = ({ isOpen, onClose, user, onCreditsUpdated }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative animate-fadeIn">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Buy Credits</h2>

                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        user={user}
                        onClose={onClose}
                        onCreditsUpdated={onCreditsUpdated}
                    />
                </Elements>
            </div>
        </div>
    );
};

export default BuyCreditsModal;
