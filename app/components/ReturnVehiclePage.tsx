'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { operationalApi, rentalApi } from '../utils/api';

interface ReturnVehiclePageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ReturnVehiclePage({ onToast }: ReturnVehiclePageProps) {
    const [rentals, setRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRental, setActiveRental] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);

    // Calculation states
    const [lateFee, setLateFee] = useState(0);
    const [damageFee, setDamageFee] = useState(0);
    const [discount, setDiscount] = useState(0);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await operationalApi.getReturnList();
            if (res.success) {
                setRentals(res.data);
            }
        } catch (error) {
            onToast('Không thể tải danh sách trả xe', 'error');
        } finally {
            setLoading(false);
        }
    }, [onToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleReturn = async (id: string) => {
        setSaving(true);
        try {
            const res = await rentalApi.updateStatus(id, 'COMPLETED');
            if (res.success) {
                onToast('Hoàn tất thu hồi xe! Đơn thuê đã đóng.', 'success');
                setActiveRental(null);
                loadData();
            }
        } catch {
            onToast('Thao tác thu hồi thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    const totalExtra = lateFee + damageFee - discount;

    return (
        <div id="return-vehicle-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Thu hồi & Trả xe</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Kiểm tra tình trạng xe sau khi thuê và hoàn tất thanh toán</p>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : rentals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏁</div>
                        <h3>Mọi xe đã được trả</h3>
                        <p>Hiện không có xe nào đang trong quá trình thuê.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Khách hàng</th>
                                <th>Xe đang thuê</th>
                                <th>Hạn trả xe</th>
                                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rentals.map((r) => (
                                <tr key={r.id} className="hover-row">
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{r.user?.email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{r.motorbike?.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.motorbike?.licensePlate}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: new Date(r.endDate) < new Date() ? 'var(--danger-color)' : 'inherit' }}>
                                            {new Date(r.endDate).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div style={{ fontSize: '11px', opacity: 0.6 }}>Còn lại: {Math.max(0, Math.ceil((new Date(r.endDate).getTime() - new Date().getTime()) / 86400000))} ngày</div>
                                    </td>
                                    <td style={{ paddingRight: '24px' }}>
                                        <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn btn-sm" onClick={() => setActiveRental(r)} style={{ background: 'var(--purple-color)', color: 'white' }}>Tiếp nhận trả xe</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Return & Inspection Dialog */}
            {activeRental && (
                <div className="modal-overlay glass-blur" onClick={() => setActiveRental(null)}>
                    <div className="modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Biên bản thu hồi xe</h3>
                            <button className="modal-close" onClick={() => setActiveRental(null)}>✕</button>
                        </div>
                        <div className="modal-body custom-scroll" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="rental-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                <div>
                                    <label className="form-label" style={{ opacity: 0.6 }}>Tổng tiền thuê</label>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{activeRental.totalPrice.toLocaleString()} đ</div>
                                </div>
                                <div>
                                    <label className="form-label" style={{ opacity: 0.6 }}>Hạn trả xe</label>
                                    <div style={{ fontWeight: 600 }}>{new Date(activeRental.endDate).toLocaleDateString('vi-VN')}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Tình trạng xe sau trả (Mock Photo)</label>
                                    <div className="image-preview-mock" style={{ height: '140px', background: 'rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chưa có ảnh tải lên</span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Phí trả trễ</label>
                                        <input type="number" className="form-input" value={lateFee} onChange={e => setLateFee(Number(e.target.value))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phí hư hỏng</label>
                                        <input type="number" className="form-input" value={damageFee} onChange={e => setDamageFee(Number(e.target.value))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Miễn giảm</label>
                                        <input type="number" className="form-input" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 500 }}>Phí phát sinh:</span>
                                    <span style={{ fontWeight: 700, color: totalExtra >= 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                                        {totalExtra >= 0 ? `+ ${totalExtra.toLocaleString()} đ` : `- ${Math.abs(totalExtra).toLocaleString()} đ`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tổng thanh toán cuối:</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>{(activeRental.totalPrice + totalExtra).toLocaleString()} đ</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setActiveRental(null)}>Quay lại</button>
                            <button className="btn" onClick={() => handleReturn(activeRental.id)} disabled={saving} style={{ background: 'var(--purple-color)', color: 'white' }}>
                                {saving ? 'Đang lưu...' : 'Xác nhận hoàn tất'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
