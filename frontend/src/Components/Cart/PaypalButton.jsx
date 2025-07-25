// PayPal ke React components ko import kar rahe hain
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

// Functional component banaya jo PayPal payment button render karega
const PaypalButton = ({ amount, onSuccess, onError }) => {
    return (
        // PayPalScriptProvider PayPal SDK ko load karta hai React app mein
        <PayPalScriptProvider
            options={{ 
                "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID, // Client ID env file se liya gaya hai
            }}
        >
            {/* Ye component actual PayPal button render karta hai */}
            <PayPalButtons
                style={{ layout: "vertical" }} // button ka layout vertical hoga

                // Jab user button click karega, ye function ek order create karega
                createOrder={(data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: parseFloat(amount).toFixed(2)
                                }
                            }
                        ]
                    });
                }}

                // Jab user payment approve karega, tab ye function chalega
                onApprove={(data, actions) => {
                    return actions.order.capture() // payment capture karte hain
                        .then(onSuccess); // agar payment successful ho to success callback chalayenge
                }}

                // Agar koi error aata hai to onError callback call hoga
                onError={onError}
            />
        </PayPalScriptProvider>
    );
};

// Component ko default export kar rahe hain taaki dusri files mein use kar sakein
export default PaypalButton;
