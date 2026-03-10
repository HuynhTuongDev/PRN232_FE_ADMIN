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

    const [km, setKm] = useState<number | string>('');
    const [fuel, setFuel] = useState<number | string>('8');
    const [note, setNote] = useState('');
    const [checks, setChecks] = useState({
        scuffs: false,
        engine: false,
        payment: false
    });
    const [mockImages, setMockImages] = useState<string[]>([]);



    const canHoanTat = checks.scuffs && checks.engine && checks.payment && km !== '';

    const handleReturn = async (id: string) => {
        setSaving(true);
        try {
            const res = await rentalApi.updateStatus(id, 'COMPLETED', { 
                km, 
                fuel, 
                note, 
                lateFee, 
                damageFee, 
                discount,
                images: mockImages 
            });
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
            {/* ... header ... */}
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
                    <div className="modal glass-card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '0' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <h3 className="modal-title">Biên bản thu hồi xe</h3>
                            <button className="modal-close" onClick={() => setActiveRental(null)}>✕</button>
                        </div>
                        <div className="modal-body custom-scroll" style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                            <div className="rental-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(var(--primary-rgb), 0.03)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                <div>
                                    <label className="form-label" style={{ opacity: 0.6, fontSize: '11px', textTransform: 'uppercase' }}>Tổng tiền thuê</label>
                                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{activeRental.totalPrice.toLocaleString()} đ</div>
                                </div>
                                <div>
                                    <label className="form-label" style={{ opacity: 0.6, fontSize: '11px', textTransform: 'uppercase' }}>Hạn trả xe</label>
                                    <div style={{ fontWeight: 600 }}>{new Date(activeRental.endDate).toLocaleDateString('vi-VN')}</div>
                                </div>
                            </div>

                            {/* Handover & User Report Comparison */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                {/* Handover State (Before) */}
                                <div style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '8px' }}>Tình trạng lúc giao</div>
                                    <div style={{ fontSize: '13px', display: 'grid', gap: '4px' }}>
                                        <div>Số KM: <strong>{activeRental.handoverKm}</strong></div>
                                        <div>Mức xăng: <strong>{activeRental.handoverFuel}/8 vạch</strong></div>
                                        {activeRental.handoverImages?.length > 0 && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '4px', marginTop: '8px' }}>
                                                {activeRental.handoverImages.map((img: string, i: number) => (
                                                    <img key={i} src={img} alt="Handover" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px' }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* User Report (Now) */}
                                <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: '8px' }}>Khách hàng vừa báo cáo</div>
                                    <div style={{ fontSize: '13px', display: 'grid', gap: '4px' }}>
                                        <div>Số KM: <strong>{activeRental.returnKm || 'N/A'}</strong></div>
                                        <div>Mức xăng: <strong>{activeRental.returnFuel ? `${activeRental.returnFuel}/8 vạch` : 'N/A'}</strong></div>
                                        {activeRental.returnImages?.length > 0 && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '4px', marginTop: '8px' }}>
                                                {activeRental.returnImages.map((img: string, i: number) => (
                                                    <img key={i} src={img} alt="User Return" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px' }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Số KM thực tế <span style={{ color: 'red' }}>*</span></label>
                                    <input type="number" className="form-input" placeholder="VD: 12600" value={km} onChange={e => setKm(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mức xăng thực tế</label>
                                    <input type="number" className="form-input" placeholder="8" value={fuel} onChange={e => setFuel(e.target.value)} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>Kiểm tra tình trạng <span style={{ color: 'red' }}>*</span></label>
                                <div style={{ display: 'grid', gap: '12px', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px' }}>
                                        <input type="checkbox" checked={checks.scuffs} onChange={e => setChecks({...checks, scuffs: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        <span>Không có trầy xước mới phát sinh</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px' }}>
                                        <input type="checkbox" checked={checks.engine} onChange={e => setChecks({...checks, engine: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        <span>Động cơ hoạt động bình thường</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px' }}>
                                        <input type="checkbox" checked={checks.payment} onChange={e => setChecks({...checks, payment: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                                        <span>Đã thu phí phát sinh/Trả cọc đầy đủ</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label" style={{ fontWeight: 600, display: 'block', marginBottom: '12px' }}>Ảnh xe lúc trả (Admin tải lên)</label>
                                
                                {/* Simulated Upload Button */}
                                <div style={{ marginBottom: '16px' }}>
                                    <input 
                                        type="file" 
                                        id="return-upload" 
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
                                        onClick={() => document.getElementById('return-upload')?.click()}
                                        style={{ 
                                            width: '100%', 
                                            height: '100px', 
                                            border: '2px dashed rgba(var(--purple-rgb, 168, 85, 247), 0.2)', 
                                            borderRadius: '12px', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            background: 'rgba(var(--purple-rgb, 168, 85, 247), 0.02)',
                                            color: 'var(--purple-color)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.05)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.02)'}
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
                                                border: '3px solid var(--purple-color)'
                                            }}
                                        >
                                            <img src={url} alt={`Custom ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'red', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✕</div>
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px' }}>Admin tải lên bằng chứng tình trạng xe lúc thu hồi.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
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

                            <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '16px', background: 'rgba(168, 85, 247, 0.03)', padding: '16px', borderRadius: '12px' }}>
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
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setActiveRental(null)}>Quay lại</button>
                            <button className="btn" onClick={() => handleReturn(activeRental.id)} disabled={saving || !canHoanTat} style={{ background: 'var(--purple-color)', color: 'white' }}>
                                {saving ? 'Đang lưu...' : 'Xác nhận & Hoàn tất'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
