'use client';

import { useEffect, useState, useCallback } from 'react';
import { rentalApi, formatPrice, formatDate, rentalStatusMap, paymentStatusMap } from '../utils/api';

interface RentalsPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function RentalsPage({ onToast }: RentalsPageProps) {
    const [allRentals, setAllRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [statusModal, setStatusModal] = useState<{ id: string; currentStatus: string } | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [saving, setSaving] = useState(false);

    // New Operational Flow States
    const [activeRental, setActiveRental] = useState<any | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showHandoverModal, setShowHandoverModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<{ url: string; title: string } | null>(null);

    const limit = 10;

    const loadRentals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await rentalApi.getAll();
            if (res.success && res.data) {
                setAllRentals(res.data.rentals || res.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRentals();
    }, [loadRentals]);

    // Client-side filtering by status
    const filteredRentals = filterStatus
        ? allRentals.filter((r: any) => r.status === filterStatus)
        : allRentals;

    const total = filteredRentals.length;
    const totalPages = Math.ceil(total / limit);
    const rentals = filteredRentals.slice((page - 1) * limit, page * limit);

    const openStatusModal = (rental: any) => {
        setStatusModal({ id: rental.id, currentStatus: rental.status });
        setNewStatus(rental.status);
    };

    const handleUpdateStatus = async (id?: string, status?: string) => {
        const targetId = id || statusModal?.id;
        const targetStatus = status || newStatus;
        
        if (!targetId) return;
        setSaving(true);
        try {
            const res = await rentalApi.updateStatus(targetId, targetStatus);
            if (res.success) {
                onToast('Cập nhật trạng thái thành công!', 'success');
                setStatusModal(null);
                setShowConfirmModal(false);
                setShowHandoverModal(false);
                setShowReturnModal(false);
                loadRentals();
            } else {
                onToast(res.error || res.message || 'Cập nhật thất bại', 'error');
            }
        } catch {
            onToast('Không thể kết nối server', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div id="rentals-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="page-header-info">
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Đơn thuê xe</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Quản lý {total} đơn thuê xe trong hệ thống</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-header" style={{ padding: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <h3 className="table-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Danh sách đơn thuê
                        </h3>
                        <div className="table-actions">
                            <div className="tab-filter glass-effect" style={{ padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                                {['', 'PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((status) => (
                                    <button
                                        key={status}
                                        className={`tab-filter-btn ${filterStatus === status ? 'active' : ''}`}
                                        onClick={() => { setFilterStatus(status); setPage(1); }}
                                        style={{ 
                                            padding: '8px 16px', 
                                            borderRadius: '8px', 
                                            fontSize: '13px', 
                                            fontWeight: 500,
                                            background: filterStatus === status ? 'var(--primary-color)' : 'transparent',
                                            color: filterStatus === status ? '#fff' : 'var(--text-secondary)',
                                            border: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {status === '' ? 'Tất cả' : (rentalStatusMap[status]?.label || status)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : rentals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>Chưa có đơn thuê nào</h3>
                        <p>Các đơn thuê xe sẽ xuất hiện ở đây</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table" id="rental-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '24px' }}>Khách hàng</th>
                                    <th>Xe</th>
                                    <th>Thời gian</th>
                                    <th>Đơn giá</th>
                                    <th>Trạng thái</th>
                                    <th style={{ paddingRight: '24px', textAlign: 'right' }}>Quy trình</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals.map((r: any) => {
                                    const statusInfo = rentalStatusMap[r.status] || { label: r.status, badge: 'neutral' };
                                    return (
                                        <tr key={r.id} className="hover-row">
                                            <td style={{ paddingLeft: '24px' }}>
                                                <div className="user-cell">
                                                    <div className="user-avatar-sm" style={{ 
                                                        background: 'linear-gradient(135deg, var(--primary-color) 0%, #a855f7 100%)',
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        width: '36px',
                                                        height: '36px'
                                                    }}>
                                                        {r.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="user-name" style={{ fontWeight: 600 }}>{r.user?.name || 'N/A'}</div>
                                                        <div className="user-email" style={{ fontSize: '12px', opacity: 0.6 }}>{r.user?.email || ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {r.motorbike?.name || 'N/A'}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.03)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                                                    {r.motorbike?.licensePlate || ''}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: 'var(--success-color)', fontSize: '10px' }}>●</span>
                                                        <span>{formatDate(r.startDate)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: 'var(--danger-color)', fontSize: '10px' }}>●</span>
                                                        <span>{formatDate(r.endDate)}</span>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{r.numberOfDays} ngày</div>
                                            </td>
                                            <td>
                                                <div className="price" style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatPrice(r.totalPrice || 0)}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span className={`badge ${statusInfo.badge}`} style={{ 
                                                        padding: '4px 10px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '11px', 
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        textAlign: 'center'
                                                    }}>
                                                        {statusInfo.label}
                                                    </span>
                                                    {r.payments && r.payments.length > 0 && (
                                                        <span style={{ 
                                                            fontSize: '10px', 
                                                            color: paymentStatusMap[r.payments[r.payments.length - 1].status]?.badge === 'success' ? 'var(--success-color)' : 'var(--text-secondary)',
                                                            fontWeight: 500,
                                                            textAlign: 'center'
                                                        }}>
                                                            💳 {paymentStatusMap[r.payments[r.payments.length - 1].status]?.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ paddingRight: '24px' }}>
                                                <div className="action-cell" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                                                    {r.status === 'PENDING' && (
                                                        <button 
                                                            className="btn btn-sm btn-primary" 
                                                            onClick={() => { setActiveRental(r); setShowConfirmModal(true); }}
                                                            style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px' }}
                                                        >
                                                            Xác nhận
                                                        </button>
                                                    )}
                                                    {r.status === 'CONFIRMED' && (
                                                        <button 
                                                            className="btn btn-sm" 
                                                            onClick={() => { setActiveRental(r); setShowHandoverModal(true); }}
                                                            style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', background: 'var(--info-color)', color: '#fff' }}
                                                        >
                                                            Bàn giao
                                                        </button>
                                                    )}
                                                    {r.status === 'ONGOING' && (
                                                        <button 
                                                            className="btn btn-sm" 
                                                            onClick={() => { setActiveRental(r); setShowReturnModal(true); }}
                                                            style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', background: 'var(--purple-color)', color: '#fff' }}
                                                        >
                                                            Trả xe
                                                        </button>
                                                    )}
                                                    <button className="action-btn glass-effect" onClick={() => { setActiveRental(r); setShowDetailModal(true); }} title="Xem chi tiết" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                                    </button>
                                                    <button className="action-btn glass-effect" onClick={() => openStatusModal(r)} title="Sửa nhanh" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <div className="pagination-info">Trang {page} / {totalPages} • Tổng {total} đơn</div>
                                <div className="pagination-controls">
                                    <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                        <button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                    ))}
                                    <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Rental Detail Modal */}
            {showDetailModal && activeRental && (
                <div className="modal-overlay glass-blur" onClick={() => setShowDetailModal(false)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', padding: '0' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: 'var(--primary-color)', color: '#fff', padding: '8px', borderRadius: '10px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                </div>
                                <div>
                                    <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Chi tiết đơn thuê</h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Mã: {activeRental.id}</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
                        </div>
                        <div className="modal-body custom-scroll" style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                                {/* Left Column: Status & Timeline & Finance */}
                                <div>
                                    <section style={{ marginBottom: '24px' }}>
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '12px', display: 'block' }}>Trạng thái & Thời gian</label>
                                        <div className="glass-effect" style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '13px' }}>Trạng thái hiện tại:</span>
                                                    <span className={`badge ${rentalStatusMap[activeRental.status]?.badge || 'neutral'}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
                                                        {rentalStatusMap[activeRental.status]?.label}
                                                    </span>
                                                </div>
                                                {activeRental.payments && activeRental.payments.length > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '13px' }}>Thanh toán:</span>
                                                        <span style={{ 
                                                            fontSize: '11px', 
                                                            fontWeight: 600, 
                                                            color: paymentStatusMap[activeRental.payments[activeRental.payments.length - 1].status]?.badge === 'success' ? 'var(--success-color)' : 'var(--warning-color)'
                                                        }}>
                                                            {paymentStatusMap[activeRental.payments[activeRental.payments.length - 1].status]?.label}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', opacity: 0.6 }}>Ngày nhận</div>
                                                    <div style={{ fontWeight: 600 }}>{formatDate(activeRental.startDate)}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', opacity: 0.6 }}>Ngày trả</div>
                                                    <div style={{ fontWeight: 600 }}>{formatDate(activeRental.endDate)}</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                ⏳ Tổng thời gian: <strong>{activeRental.numberOfDays} ngày</strong>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '12px', display: 'block' }}>Thanh toán</label>
                                        <div className="glass-effect" style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(var(--primary-rgb), 0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ opacity: 0.7 }}>Đơn giá thuê:</span>
                                                <span>{formatPrice((activeRental.totalPrice / activeRental.numberOfDays).toFixed(0))} / ngày</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ opacity: 0.7 }}>Phí dịch vụ:</span>
                                                <span>0đ</span>
                                            </div>
                                            <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600 }}>Tổng tiền:</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>{formatPrice(activeRental.totalPrice)}</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: User & Motorbike */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <section>
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '12px', display: 'block' }}>Khách hàng</label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div className="user-avatar" style={{ width: '40px', height: '40px', background: 'var(--primary-color)', color: '#fff' }}>{activeRental.user?.name?.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{activeRental.user?.name}</div>
                                                <div style={{ fontSize: '12px', opacity: 0.7 }}>{activeRental.user?.email}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--primary-color)', marginTop: '4px', fontWeight: 500 }}>ID: {activeRental.userId}</div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '12px', display: 'block' }}>Phương tiện</label>
                                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '12px' }}>
                                            <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400" alt="Motorbike" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{activeRental.motorbike?.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{activeRental.motorbike?.licensePlate}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Xe côn</span>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
                            {activeRental.status === 'PENDING' && (
                                <button className="btn btn-primary" onClick={() => { setShowDetailModal(false); setShowConfirmModal(true); }}>Tiến hành xác nhận</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal (Quick Edit) */}
            {statusModal && (
                <div className="modal-overlay glass-blur" onClick={() => setStatusModal(null)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '0', border: '1px solid rgba(0, 0, 0, 0.05)', background: '#fff', boxShadow: 'var(--shadow-premium)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Cập nhật trạng thái</h3>
                            <button className="modal-close" onClick={() => setStatusModal(null)} style={{ opacity: 0.5 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500, opacity: 0.7 }}>Trạng thái hiện tại</label>
                                <div>
                                    <span className={`badge ${(rentalStatusMap[statusModal.currentStatus]?.badge) || 'neutral'}`} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                                        {rentalStatusMap[statusModal.currentStatus]?.label || statusModal.currentStatus}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Chọn trạng thái mới</label>
                                <select className="form-select" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                    <option value="PENDING">Chờ xác nhận</option>
                                    <option value="CONFIRMED">Đã xác nhận</option>
                                    <option value="ONGOING">Đang thuê</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setStatusModal(null)} style={{ borderRadius: 'var(--radius-md)' }}>Hủy</button>
                            <button className="btn btn-primary" onClick={() => handleUpdateStatus()} disabled={saving || newStatus === statusModal.currentStatus} style={{ borderRadius: 'var(--radius-md)' }}>
                                {saving ? 'Đang cập nhật...' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Workflow Modal: Xác nhận người thuê */}
            {showConfirmModal && activeRental && (
                <div className="modal-overlay glass-blur" onClick={() => setShowConfirmModal(false)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '0' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <div>
                                <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Xác nhận hồ sơ khách thuê</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Mã đơn: {activeRental.id}</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowConfirmModal(false)}>✕</button>
                        </div>
                        <div className="modal-body custom-scroll" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                            {/* User Info Section */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.03)' }}>
                                <div className="user-avatar" style={{ width: '48px', height: '48px', background: 'var(--primary-color)', color: '#fff', fontSize: '20px' }}>
                                    {activeRental.user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{activeRental.user?.name}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.7 }}>{activeRental.user?.email}</div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div style={{ marginBottom: '24px' }}>
                                <label className="form-label" style={{ fontWeight: 600, marginBottom: '12px', display: 'block' }}>Giấy tờ định danh đã tải lên</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    {[
                                        { key: 'idFront', label: 'CCCD Trước', url: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=500' },
                                        { key: 'idBack', label: 'CCCD Sau', url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500' },
                                        { key: 'license', label: 'Bằng lái xe', url: 'https://images.unsplash.com/photo-1559030623-0226b1241edd?w=500' }
                                    ].map((doc) => (
                                        <div key={doc.key} className="doc-preview-item" onClick={() => setSelectedDoc({ url: doc.url, title: doc.label })}>
                                            <div style={{ 
                                                aspectRatio: '3/2', 
                                                borderRadius: '8px', 
                                                overflow: 'hidden', 
                                                border: '1px solid rgba(0,0,0,0.1)', 
                                                position: 'relative',
                                                cursor: 'pointer'
                                            }}>
                                                <img src={doc.url} alt={doc.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div className="doc-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '11px', textAlign: 'center', marginTop: '6px', fontWeight: 500 }}>{doc.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '20px' }}>
                                <label className="form-label" style={{ fontWeight: 600, marginBottom: '12px', display: 'block' }}>Danh mục kiểm tra</label>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input type="checkbox" style={{ width: '18px', height: '18px' }} defaultChecked />
                                        <span>Đã đối chiếu ảnh chân dung với CCCD</span>
                                    </label>
                                    <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input type="checkbox" style={{ width: '18px', height: '18px' }} defaultChecked />
                                        <span>Địa chỉ thường trú trùng khớp hợp đồng</span>
                                    </label>
                                    <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input type="checkbox" style={{ width: '18px', height: '18px' }} defaultChecked />
                                        <span>Khách đã thanh toán đặt cọc đơn</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '20px' }}>
                                <label className="form-label">Ghi chú nội bộ</label>
                                <textarea className="form-input" placeholder="Nhập ghi chú nếu có..." style={{ height: '80px' }}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => handleUpdateStatus(activeRental.id, 'CANCELLED')} style={{ color: 'var(--danger-color)' }}>Từ chối đơn</button>
                            <button className="btn btn-primary" onClick={() => handleUpdateStatus(activeRental.id, 'CONFIRMED')} disabled={saving}>
                                {saving ? 'Đang xác nhận...' : 'Duyệt & Xác nhận đơn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Lightbox */}
            {selectedDoc && (
                <div className="modal-overlay glass-blur" onClick={() => setSelectedDoc(null)} style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1100 }}>
                    <div className="modal-close" style={{ position: 'absolute', top: '24px', right: '24px', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>✕</div>
                    <img src={selectedDoc.url} alt={selectedDoc.title} style={{ maxWidth: '90%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }} />
                    <div style={{ position: 'absolute', bottom: '32px', color: '#fff', fontWeight: 600, fontSize: '16px' }}>{selectedDoc.title}</div>
                </div>
            )}

            {/* Workflow Modal: Bàn giao xe */}
            {showHandoverModal && activeRental && (
                <div className="modal-overlay glass-blur" onClick={() => setShowHandoverModal(false)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '0' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(14, 165, 233, 0.05)' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--info-color)' }}>Bàn giao phương tiện</h3>
                            <button className="modal-close" onClick={() => setShowHandoverModal(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div className="rental-summary" style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.02)' }}>
                                <div style={{ fontWeight: 600 }}>{activeRental.motorbike?.name}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Biển số: {activeRental.motorbike?.licensePlate}</div>
                            </div>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontSize: '12px', opacity: 0.7 }}>Số KM hiện tại</label>
                                        <input type="number" className="form-input" placeholder="0" style={{ background: 'rgba(0,0,0,0.02)' }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ fontSize: '12px', opacity: 0.7 }}>Mức xăng (vạch)</label>
                                        <input type="number" className="form-input" placeholder="8/8" style={{ background: 'rgba(0,0,0,0.02)' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked />
                                        <span>Xe sạch sẽ, không có trầy xước mới</span>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked />
                                        <span>Đã giao 02 mũ bảo hiểm & áo mưa</span>
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked />
                                        <span>Khách đã ký vào biên bản bàn giao</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowHandoverModal(false)}>Quay lại</button>
                            <button className="btn" onClick={() => handleUpdateStatus(activeRental.id, 'ONGOING')} style={{ background: 'var(--info-color)', color: '#fff', borderRadius: '10px' }} disabled={saving}>
                                {saving ? 'Đang xử lý...' : 'Hoàn tất bàn giao'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Workflow Modal: Trả xe */}
            {showReturnModal && activeRental && (
                <div className="modal-overlay glass-blur" onClick={() => setShowReturnModal(false)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '0' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(168, 85, 247, 0.05)' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--purple-color)' }}>Kiểm tra & Thu hồi xe</h3>
                            <button className="modal-close" onClick={() => setShowReturnModal(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Tình trạng ngoại quan</label>
                                <select className="form-select" style={{ width: '100%', background: 'rgba(0,0,0,0.02)' }}>
                                    <option value="good">Tốt - Không trầy xước</option>
                                    <option value="scratched">Có trầy xước nhẹ</option>
                                    <option value="damaged">Hư hỏng cần sửa chữa</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: '12px', opacity: 0.7 }}>Số KM khi trả</label>
                                    <input type="number" className="form-input" style={{ background: 'rgba(0,0,0,0.02)' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: '12px', opacity: 0.7 }}>Phí phát sinh (nếu có)</label>
                                    <input type="number" className="form-input" placeholder="0đ" style={{ background: 'rgba(0,0,0,0.02)' }} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                                    <input type="checkbox" defaultChecked />
                                    <span>Đã thu hồi đủ phụ kiện (Mũ, giấy tờ)</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}>
                                    <input type="checkbox" defaultChecked />
                                    <span>Khách đã thanh toán phần còn lại</span>
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Quay lại</button>
                            <button className="btn" onClick={() => handleUpdateStatus(activeRental.id, 'COMPLETED')} style={{ background: 'var(--purple-color)', color: '#fff', borderRadius: '10px' }} disabled={saving}>
                                {saving ? 'Đang xử lý...' : 'Hoàn tất trả xe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .tab-filter-btn:hover:not(.active) {
                    background: rgba(0, 0, 0, 0.04) !important;
                }
                .hover-row:hover {
                    background: rgba(0, 0, 0, 0.01);
                }
                .action-btn:hover {
                    background: var(--primary-color) !important;
                    color: white !important;
                    transform: translateY(-2px);
                }
                .checkbox-item input:checked + span {
                    color: var(--primary-color);
                    font-weight: 500;
                }
                .doc-preview-item:hover .doc-overlay {
                    opacity: 1 !important;
                }
                .doc-preview-item {
                    transition: transform 0.2s;
                    cursor: pointer;
                }
                .doc-preview-item:hover {
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
