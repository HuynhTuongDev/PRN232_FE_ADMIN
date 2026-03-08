'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { operationalApi, rentalApi } from '../utils/api';

interface HandoverPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function HandoverPage({ onToast }: HandoverPageProps) {
    const [rentals, setRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRental, setActiveRental] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await operationalApi.getHandoverList();
            if (res.success) {
                setRentals(res.data);
            }
        } catch (error) {
            onToast('Không thể tải danh sách bàn giao', 'error');
        } finally {
            setLoading(false);
        }
    }, [onToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleHandover = async (id: string) => {
        setSaving(true);
        try {
            const res = await rentalApi.updateStatus(id, 'ONGOING');
            if (res.success) {
                onToast('Đã bàn giao xe thành công! Trạng thái: Đang thuê.', 'success');
                setActiveRental(null);
                loadData();
            }
        } catch {
            onToast('Thao tác bàn giao thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div id="handover-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bàn giao xe</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Ghi nhận thông tin và giao xe cho khách hàng</p>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : rentals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔑</div>
                        <h3>Chưa có đơn sẵn sàng</h3>
                        <p>Duyệt xác minh người thuê trước khi bàn giao xe.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Khách hàng</th>
                                <th>Xe</th>
                                <th>Thời gian thuê</th>
                                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rentals.map((r) => (
                                <tr key={r.id} className="hover-row">
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.6 }}>ID: {r.id.split('-')[0]}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{r.motorbike?.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.motorbike?.licensePlate}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px' }}>{new Date(r.startDate).toLocaleDateString('vi-VN')}</div>
                                        <div style={{ fontSize: '11px', opacity: 0.6 }}>{r.numberOfDays} ngày</div>
                                    </td>
                                    <td style={{ paddingRight: '24px' }}>
                                        <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                                            <button className="btn btn-sm btn-primary" onClick={() => setActiveRental(r)}>Bắt đầu bàn giao</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Handover Dialog */}
            {activeRental && (
                <div className="modal-overlay glass-blur" onClick={() => setActiveRental(null)}>
                    <div className="modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Biên bản bàn giao</h3>
                            <button className="modal-close" onClick={() => setActiveRental(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="rental-summary-box" style={{ background: 'rgba(var(--primary-rgb), 0.03)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label className="form-label" style={{ opacity: 0.6 }}>Khách thuê</label>
                                        <div style={{ fontWeight: 600 }}>{activeRental.user?.name}</div>
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ opacity: 0.6 }}>Xe bàn giao</label>
                                        <div style={{ fontWeight: 600 }}>{activeRental.motorbike?.name}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Số KM hiện tại</label>
                                    <input type="number" className="form-input" placeholder="VD: 12500" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mức xăng (1-8 vạch)</label>
                                    <input type="number" className="form-input" placeholder="8" />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label">Tình trạng xe (ghi chú trầy xước)</label>
                                <textarea className="form-input" style={{ height: '80px' }} placeholder="VD: Xe không trầy xước, phanh ổn định..."></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ảnh xe lúc nhận (Mock)</label>
                                <div className="image-upload-mock" style={{ height: '120px', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.01)' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px' }}>📸</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Bấm để tải ảnh lên</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setActiveRental(null)}>Hủy</button>
                            <button className="btn btn-primary" onClick={() => handleHandover(activeRental.id)} disabled={saving}>
                                {saving ? 'Đang lưu...' : 'Xác nhận & Giao xe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
