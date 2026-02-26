'use client';

import { useEffect, useState, useCallback } from 'react';
import { rentalApi, formatPrice, formatDate, rentalStatusMap } from '../utils/api';

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

    const handleUpdateStatus = async () => {
        if (!statusModal) return;
        setSaving(true);
        try {
            const res = await rentalApi.updateStatus(statusModal.id, newStatus);
            if (res.success) {
                onToast('Cập nhật trạng thái thành công!', 'success');
                setStatusModal(null);
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
        <div id="rentals-page">
            <div className="page-header">
                <div className="page-header-info">
                    <h2>Đơn thuê xe</h2>
                    <p>Quản lý {total} đơn thuê xe trong hệ thống</p>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">Danh sách đơn thuê</h3>
                    <div className="table-actions">
                        <div className="tab-filter">
                            {['', 'PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((status) => (
                                <button
                                    key={status}
                                    className={`tab-filter-btn ${filterStatus === status ? 'active' : ''}`}
                                    onClick={() => { setFilterStatus(status); setPage(1); }}
                                >
                                    {status === '' ? 'Tất cả' : (rentalStatusMap[status]?.label || status)}
                                </button>
                            ))}
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
                                    <th>Khách hàng</th>
                                    <th>Xe</th>
                                    <th>Ngày thuê</th>
                                    <th>Ngày trả</th>
                                    <th>Số ngày</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentals.map((r: any) => {
                                    const statusInfo = rentalStatusMap[r.status] || { label: r.status, badge: 'neutral' };
                                    return (
                                        <tr key={r.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-sm customer">
                                                        {r.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="user-name">{r.user?.name || 'N/A'}</div>
                                                        <div className="user-email">{r.user?.email || ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {r.motorbike?.name || 'N/A'}
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.motorbike?.licensePlate || ''}</div>
                                            </td>
                                            <td>{formatDate(r.startDate)}</td>
                                            <td>{formatDate(r.endDate)}</td>
                                            <td style={{ textAlign: 'center' }}>{r.numberOfDays}</td>
                                            <td className="price">{formatPrice(r.totalPrice || 0)}</td>
                                            <td><span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span></td>
                                            <td>
                                                <div className="action-cell">
                                                    <button className="action-btn edit" onClick={() => openStatusModal(r)} title="Cập nhật trạng thái">✏️</button>
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

            {/* Status Update Modal */}
            {statusModal && (
                <div className="modal-overlay" onClick={() => setStatusModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Cập nhật trạng thái đơn thuê</h3>
                            <button className="modal-close" onClick={() => setStatusModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Trạng thái hiện tại</label>
                                <div style={{ marginBottom: '16px' }}>
                                    <span className={`badge ${(rentalStatusMap[statusModal.currentStatus]?.badge) || 'neutral'}`}>
                                        {rentalStatusMap[statusModal.currentStatus]?.label || statusModal.currentStatus}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Trạng thái mới</label>
                                <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                    <option value="PENDING">Chờ xác nhận</option>
                                    <option value="CONFIRMED">Đã xác nhận</option>
                                    <option value="ONGOING">Đang thuê</option>
                                    <option value="COMPLETED">Hoàn thành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setStatusModal(null)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={saving || newStatus === statusModal.currentStatus} id="btn-update-rental-status">
                                {saving ? 'Đang cập nhật...' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
