'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { paymentApi, formatPrice, formatDateTime, paymentStatusMap, paymentMethodMap } from '../utils/api';

interface Payment {
    id: string;
    rentalId: string;
    customerName?: string; // Legacy
    amount: number | string;
    method: string;
    status: string;
    date?: string; // Legacy
    createdAt?: string;
    transactionId: string;
    rental?: {
        user?: {
            name: string;
        };
    };
}

export default function PaymentsPage({ onToast }: { onToast: (msg: string, type: any) => void }) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [methodFilter, setMethodFilter] = useState('ALL');
    
    // Modal state
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await paymentApi.getAll();
            if (res.success) {
                setPayments(res.data);
            }
        } catch (error) {
            onToast('Không thể tải danh sách thanh toán', 'error');
        } finally {
            setLoading(false);
        }
    }, [onToast]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setUpdating(true);
        try {
            const res = await paymentApi.updateStatus(id, newStatus);
            if (res.success) {
                onToast('Cập nhật trạng thái thành công', 'success');
                fetchPayments();
                setShowModal(false);
            }
        } catch (error) {
            onToast('Lỗi khi cập nhật trạng thái', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const filteredPayments = payments.filter(p => {
        const customerName = p.rental?.user?.name || p.customerName || '';
        const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    return (
        <div id="payments-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="page-header-info">
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Thanh toán</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Quản lý và tra cứu lịch sử giao dịch</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-header" style={{ padding: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.01)' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
                            <input 
                                className="search-input" 
                                placeholder="Tìm theo tên, mã GD..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <select 
                            className="form-select" 
                            style={{ width: '160px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            {Object.entries(paymentStatusMap).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                        <select 
                            className="form-select" 
                            style={{ width: '160px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }}
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                        >
                            <option value="ALL">Tất cả phương thức</option>
                            {Object.entries(paymentMethodMap).map(([key, val]) => (
                                <option key={key} value={key}>{val}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Mã GD</th>
                                <th>Khách hàng</th>
                                <th>Số tiền</th>
                                <th>Phương thức</th>
                                <th>Ngày giao dịch</th>
                                <th>Trạng thái</th>
                                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length > 0 ? (
                                filteredPayments.map((p) => (
                                    <tr key={p.id}>
                                        <td style={{ paddingLeft: '24px' }}>
                                            <span style={{ fontWeight: 600 }}>{p.id.substring(0, 8)}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{p.rental?.user?.name || p.customerName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã đơn: {p.rentalId.substring(0, 8)}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{formatPrice(p.amount)}</span>
                                        </td>
                                        <td>{paymentMethodMap[p.method] || p.method}</td>
                                        <td>{formatDateTime(p.createdAt || p.date || '')}</td>
                                        <td>
                                            <span className={`badge badge-${paymentStatusMap[p.status]?.badge || 'gray'}`}>
                                                {paymentStatusMap[p.status]?.label || p.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                            <button 
                                                className="btn btn-icon" 
                                                title="Xem chi tiết"
                                                onClick={() => {
                                                    setSelectedPayment(p);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        Không tìm thấy giao dịch nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Detail Modal */}
            {showModal && selectedPayment && (
                <div className="modal-overlay glass-blur" onClick={() => setShowModal(false)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '0', border: '1px solid rgba(0, 0, 0, 0.05)', background: '#fff', boxShadow: 'var(--shadow-premium)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Chi tiết thanh toán</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ opacity: 0.5 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Mã thanh toán:</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPayment.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Khách hàng:</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPayment.rental?.user?.name || selectedPayment.customerName}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Mã đơn thuê:</span>
                                    <span style={{ fontWeight: 600 }}>{selectedPayment.rentalId}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Số tiền:</span>
                                    <span style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.1rem' }}>{formatPrice(selectedPayment.amount)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Phương thức:</span>
                                    <span>{paymentMethodMap[selectedPayment.method] || selectedPayment.method}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Mã tham chiếu:</span>
                                    <code style={{ background: 'rgba(0,0,0,0.03)', padding: '2px 6px', borderRadius: '4px' }}>{selectedPayment.transactionId || 'N/A'}</code>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Trạng thái:</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {Object.entries(paymentStatusMap).map(([key, val]) => (
                                            <button 
                                                key={key}
                                                onClick={() => handleUpdateStatus(selectedPayment.id, key)}
                                                disabled={updating || selectedPayment.status === key}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    cursor: selectedPayment.status === key ? 'default' : 'pointer',
                                                    border: '1px solid currentColor',
                                                    background: selectedPayment.status === key ? `var(--${val.badge}-color)` : 'transparent',
                                                    color: selectedPayment.status === key ? '#fff' : `var(--${val.badge}-color)`,
                                                    opacity: updating ? 0.6 : 1
                                                }}
                                            >
                                                {val.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
