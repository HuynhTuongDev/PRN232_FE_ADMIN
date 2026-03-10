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

    const [km, setKm] = useState<number | string>('');
    const [fuel, setFuel] = useState<number | string>('8');
    const [note, setNote] = useState('');
    const [checks, setChecks] = useState({
        clean: false,
        helmets: false,
        contract: false
    });
    const [mockImages, setMockImages] = useState<string[]>([]);



    const canGiaoXe = checks.clean && checks.helmets && checks.contract && km !== '';

    const handleHandover = async (id: string) => {
        setSaving(true);
        try {
            const res = await rentalApi.updateStatus(id, 'ONGOING', { km, fuel, note, images: mockImages });
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
            {/* ... header unchanged ... */}
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
                    <div className="modal glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '0' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <h3 className="modal-title">Biên bản bàn giao</h3>
                            <button className="modal-close" onClick={() => setActiveRental(null)}>✕</button>
                        </div>
                        <div className="modal-body custom-scroll" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="rental-summary-box" style={{ background: 'rgba(var(--primary-rgb), 0.03)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label className="form-label" style={{ opacity: 0.6, fontSize: '11px', textTransform: 'uppercase' }}>Khách thuê</label>
                                        <div style={{ fontWeight: 600 }}>{activeRental.user?.name}</div>
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ opacity: 0.6, fontSize: '11px', textTransform: 'uppercase' }}>Xe bàn giao</label>
                                        <div style={{ fontWeight: 600 }}>{activeRental.motorbike?.name}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Số KM hiện tại <span style={{ color: 'red' }}>*</span></label>
                                    <input type="number" className="form-input" placeholder="VD: 12500" value={km} onChange={e => setKm(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mức xăng (1-8 vạch)</label>
                                    <input type="number" className="form-input" placeholder="8" value={fuel} onChange={e => setFuel(e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Tình trạng xe (ghi chú trầy xước)</label>
                                <textarea className="form-input" style={{ height: '80px' }} placeholder="VD: Xe không trầy xước, phanh ổn định..." value={note} onChange={e => setNote(e.target.value)}></textarea>
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>Kiểm tra các hạng mục <span style={{ color: 'red' }}>*</span></label>
                                <div style={{ display: 'grid', gap: '12px', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px' }}>
                                        <input type="checkbox" checked={checks.clean} onChange={e => setChecks({...checks, clean: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        <span>Xe đã được rửa sạch sẽ</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px' }}>
                                        <input type="checkbox" checked={checks.helmets} onChange={e => setChecks({...checks, helmets: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        <span>Đã giao 02 mũ bảo hiểm & áo mưa</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px' }}>
                                        <input type="checkbox" checked={checks.contract} onChange={e => setChecks({...checks, contract: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        <span>Khách đã ký biên bản bàn giao điện tử</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>Ảnh xe lúc nhận (Admin tải lên)</label>
                                
                                {/* Simulated Upload Button */}
                                <div style={{ marginBottom: '16px' }}>
                                    <input 
                                        type="file" 
                                        id="handover-upload" 
                                        multiple 
                                        accept="image/*" 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            if (files) {
                                                const newImages = Array.from(files).map(file => URL.createObjectURL(file));
                                                setMockImages([...mockImages, ...newImages]);
                                            }
                                        }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => document.getElementById('handover-upload')?.click()}
                                        style={{ 
                                            width: '100%', 
                                            height: '100px', 
                                            border: '2px dashed rgba(var(--primary-rgb), 0.2)', 
                                            borderRadius: '12px', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            background: 'rgba(var(--primary-rgb), 0.02)',
                                            color: 'var(--primary-color)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.05)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.02)'}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📤</div>
                                        <div style={{ fontSize: '12px', fontWeight: 600 }}>Tải ảnh từ thiết bị (Simulated)</div>
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                                    {/* Display custom uploaded images */}
                                    {mockImages.map((url, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => setMockImages(mockImages.filter(img => img !== url))}
                                            style={{ 
                                                position: 'relative', 
                                                aspectRatio: '1', 
                                                borderRadius: '8px', 
                                                overflow: 'hidden', 
                                                cursor: 'pointer',
                                                border: '3px solid var(--primary-color)'
                                            }}
                                        >
                                            <img src={url} alt={`Custom ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'red', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✕</div>
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px' }}>Admin tải lên ít nhất 1 ảnh minh họa tình trạng xe lúc bàn giao.</p>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setActiveRental(null)}>Hủy</button>
                            <button className="btn btn-primary" onClick={() => handleHandover(activeRental.id)} disabled={saving || !canGiaoXe}>
                                {saving ? 'Đang lưu...' : 'Xác nhận & Giao xe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
