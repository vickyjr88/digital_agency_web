import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function BillingCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const reference = searchParams.get('reference') || searchParams.get('trxref');

        if (!reference) {
            setStatus('error');
            setMessage('No payment reference found.');
            return;
        }

        verify(reference);
    }, []);

    const verify = async (reference) => {
        try {
            const response = await api.verifyPayment(reference);
            if (response.status === 'success') {
                setStatus('success');
                setMessage('Payment successful! Your subscription has been activated.');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            } else {
                setStatus('error');
                setMessage('Payment verification failed. Please contact support.');
            }
        } catch (error) {
            console.error("Verification error:", error);
            setStatus('error');
            setMessage('An error occurred while verifying your payment.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                        <p className="text-gray-600">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="text-green-500 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
                        <p className="text-gray-600 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="text-red-500 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
