/**
 * Payment Methods Page
 * Allows users to manage their withdrawal payment methods (mobile money, bank accounts)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
    ArrowLeft, Smartphone, Building, CreditCard, Plus, Trash2,
    Star, StarOff, CheckCircle, Loader2, Phone, User, Edit2, X
} from 'lucide-react';
import './PaymentMethods.css';

const METHOD_CONFIG = {
    mpesa: {
        label: 'M-Pesa',
        icon: Smartphone,
        color: '#4CAF50',
        description: 'Safaricom M-Pesa mobile wallet'
    },
    airtel_money: {
        label: 'Airtel Money',
        icon: Smartphone,
        color: '#E53935',
        description: 'Airtel Money mobile wallet'
    },
    bank_transfer: {
        label: 'Bank Transfer',
        icon: Building,
        color: '#1976D2',
        description: 'Direct bank account transfer'
    }
};

export default function PaymentMethods() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [hasPrimary, setHasPrimary] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [formData, setFormData] = useState({
        method_type: 'mpesa',
        phone_number: '',
        account_name: '',
        bank_name: '',
        bank_code: '',
        account_number: '',
        is_primary: true
    });

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        setLoading(true);
        try {
            const response = await api.getPaymentMethods();
            setPaymentMethods(response.payment_methods || []);
            setHasPrimary(response.has_primary || false);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            toast.error('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        // Validate
        if (formData.method_type !== 'bank_transfer' && !formData.phone_number) {
            toast.error('Phone number is required');
            return;
        }
        if (formData.method_type === 'bank_transfer' && (!formData.bank_name || !formData.account_number)) {
            toast.error('Bank name and account number are required');
            return;
        }
        if (!formData.account_name) {
            toast.error('Account name is required');
            return;
        }

        setProcessing(true);
        try {
            await api.createPaymentMethod(formData);
            toast.success('Payment method added');
            setShowAddModal(false);
            resetForm();
            fetchPaymentMethods();
        } catch (error) {
            console.error('Error adding:', error);
            toast.error(error.message || 'Failed to add payment method');
        } finally {
            setProcessing(false);
        }
    };

    const handleSetPrimary = async (methodId) => {
        try {
            await api.setPaymentMethodPrimary(methodId);
            toast.success('Primary payment method updated');
            fetchPaymentMethods();
        } catch (error) {
            console.error('Error setting primary:', error);
            toast.error(error.message || 'Failed to update');
        }
    };

    const handleDelete = async (methodId) => {
        try {
            await api.deletePaymentMethod(methodId);
            toast.success('Payment method deleted');
            setDeleteConfirm(null);
            fetchPaymentMethods();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error(error.message || 'Failed to delete');
        }
    };

    const resetForm = () => {
        setFormData({
            method_type: 'mpesa',
            phone_number: '',
            account_name: '',
            bank_name: '',
            bank_code: '',
            account_number: '',
            is_primary: !hasPrimary
        });
    };

    return (
        <div className="payment-methods-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-content">
                    <h1>
                        <CreditCard size={28} />
                        Payment Methods
                    </h1>
                    <p>Manage your withdrawal destinations for M-Pesa, Airtel Money, or Bank Transfer</p>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
                    <Plus size={18} />
                    Add Method
                </button>
            </div>

            {/* Info Banner */}
            <div className="info-banner">
                <Smartphone size={20} />
                <div>
                    <strong>Important:</strong> Make sure your payment details are correct. Withdrawals will be sent to your primary payment method.
                </div>
            </div>

            {/* Payment Methods List */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading payment methods...</p>
                </div>
            ) : paymentMethods.length === 0 ? (
                <div className="empty-state">
                    <CreditCard size={48} className="icon" />
                    <h2>No Payment Methods</h2>
                    <p>Add a payment method to receive your withdrawals.</p>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        Add Payment Method
                    </button>
                </div>
            ) : (
                <div className="methods-list">
                    {paymentMethods.map(method => {
                        const config = METHOD_CONFIG[method.method_type] || METHOD_CONFIG.mpesa;
                        const MethodIcon = config.icon;

                        return (
                            <div key={method.id} className={`method-card ${method.is_primary ? 'primary' : ''}`}>
                                <div className="method-icon" style={{ background: config.color }}>
                                    <MethodIcon size={24} />
                                </div>

                                <div className="method-details">
                                    <div className="method-header">
                                        <h3>{config.label}</h3>
                                        {method.is_primary && (
                                            <span className="primary-badge">
                                                <Star size={12} />
                                                Primary
                                            </span>
                                        )}
                                        {method.is_verified && (
                                            <span className="verified-badge">
                                                <CheckCircle size={12} />
                                                Verified
                                            </span>
                                        )}
                                    </div>

                                    <div className="method-info">
                                        {method.method_type !== 'bank_transfer' ? (
                                            <>
                                                <div className="info-row">
                                                    <Phone size={14} />
                                                    <span>{method.phone_display || method.phone_number}</span>
                                                </div>
                                                <div className="info-row">
                                                    <User size={14} />
                                                    <span>{method.account_name}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="info-row">
                                                    <Building size={14} />
                                                    <span>{method.bank_name}</span>
                                                </div>
                                                <div className="info-row">
                                                    <CreditCard size={14} />
                                                    <span>{method.account_number}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="method-actions">
                                    {!method.is_primary && (
                                        <button
                                            className="action-btn set-primary"
                                            onClick={() => handleSetPrimary(method.id)}
                                            title="Set as primary"
                                        >
                                            <StarOff size={18} />
                                        </button>
                                    )}
                                    <button
                                        className="action-btn delete"
                                        onClick={() => setDeleteConfirm(method.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Payment Method Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <Plus size={24} />
                            <h2>Add Payment Method</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAdd}>
                            <div className="modal-body">
                                {/* Method Type Selection */}
                                <div className="form-group">
                                    <label>Payment Type</label>
                                    <div className="method-type-grid">
                                        {Object.entries(METHOD_CONFIG).map(([type, config]) => {
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`type-option ${formData.method_type === type ? 'selected' : ''}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, method_type: type }))}
                                                >
                                                    <div className="type-icon" style={{ background: config.color }}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <span>{config.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Mobile Money Fields */}
                                {formData.method_type !== 'bank_transfer' && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="phone_number">Phone Number *</label>
                                            <input
                                                id="phone_number"
                                                name="phone_number"
                                                type="tel"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                placeholder="07XXXXXXXX or 254XXXXXXXXX"
                                                required
                                            />
                                            <span className="hint">Enter your {METHOD_CONFIG[formData.method_type]?.label} registered number</span>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="account_name">Account Name *</label>
                                            <input
                                                id="account_name"
                                                name="account_name"
                                                type="text"
                                                value={formData.account_name}
                                                onChange={handleChange}
                                                placeholder="Name as registered on the account"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Bank Transfer Fields */}
                                {formData.method_type === 'bank_transfer' && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="bank_name">Bank Name *</label>
                                            <input
                                                id="bank_name"
                                                name="bank_name"
                                                type="text"
                                                value={formData.bank_name}
                                                onChange={handleChange}
                                                placeholder="e.g., Equity Bank, KCB, etc."
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="account_number">Account Number *</label>
                                            <input
                                                id="account_number"
                                                name="account_number"
                                                type="text"
                                                value={formData.account_number}
                                                onChange={handleChange}
                                                placeholder="Your bank account number"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="account_name">Account Holder Name *</label>
                                            <input
                                                id="account_name"
                                                name="account_name"
                                                type="text"
                                                value={formData.account_name}
                                                onChange={handleChange}
                                                placeholder="Name as on bank account"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Primary Toggle */}
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_primary"
                                            checked={formData.is_primary}
                                            onChange={handleChange}
                                        />
                                        <span className="checkbox-label">
                                            <Star size={16} />
                                            Set as primary payment method
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="spin" size={18} />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            Add Payment Method
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content small" onClick={e => e.stopPropagation()}>
                        <div className="modal-header danger">
                            <Trash2 size={24} />
                            <h2>Delete Payment Method?</h2>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this payment method? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={() => handleDelete(deleteConfirm)}
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
