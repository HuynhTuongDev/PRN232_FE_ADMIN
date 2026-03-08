'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { operationalApi } from '../utils/api';

interface VerifyUsersPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function VerifyUsersPage({ onToast }: VerifyUsersPageProps) {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<{ url: string; title: string } | null>(null);
    const [rejecting, setRejecting] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await operationalApi.getPendingVerifications();
            if (res.success) {
                setVerifications(res.data);
            }
        } catch (error) {
            onToast('Không thể tải dữ liệu xác minh', 'error');
        } finally {
            setLoading(false);
        }
    }, [onToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setSaving(true);
        try {
            const res = await operationalApi.updateVerification(id, status, reason);
            if (res.success) {
                onToast(status === 'APPROVED' ? 'Đã duyệt yêu cầu thành công!' : 'Đã từ chối yêu cầu.', 'success');
                setRejecting(null);
                setReason('');
                loadData();
            }
        } catch {
            onToast('Thao tác thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div id="verify-users-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Xác nhận người thuê</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Kiểm tra CCCD và Bằng lái xe của khách hàng mới</p>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : verifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🛡️</div>
                        <h3>Mọi thứ đã được xử lý!</h3>
                        <p>Hiện không có yêu cầu xác minh nào đang chờ.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Khách hàng</th>
                                <th>Ngày đăng ký</th>
                                <th>Tài liệu đã tải lên</th>
                                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {verifications.map((v) => (
                                <tr key={v.id} className="hover-row">
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div className="user-cell">
                                            <div className="user-avatar-sm" style={{ background: 'var(--primary-color)', color: '#fff' }}>{v.name.charAt(0)}</div>
                                            <div>
                                                <div className="user-name" style={{ fontWeight: 600 }}>{v.name}</div>
                                                <div className="user-email" style={{ fontSize: '12px', opacity: 0.6 }}>{v.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{v.date}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="doc-chip" onClick={() => setSelectedDoc({ url: v.documents.idFront, title: 'CCCD Mặt trước' })}>CCCD Trước</button>
                                            <button className="doc-chip" onClick={() => setSelectedDoc({ url: v.documents.idBack, title: 'CCCD Mặt sau' })}>CCCD Sau</button>
                                            <button className="doc-chip" onClick={() => setSelectedDoc({ url: v.documents.license, title: 'Bằng lái xe' })}>Bằng lái</button>
                                        </div>
                                    </td>
                                    <td style={{ paddingRight: '24px' }}>
                                        <div className="action-cell" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                                            <button className="btn btn-sm" onClick={() => setRejecting(v.id)} style={{ background: 'var(--danger-color)', color: 'white' }}>Từ chối</button>
                                            <button className="btn btn-sm btn-primary" onClick={() => handleAction(v.id, 'APPROVED')}>Duyệt</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Document Preview Modal */}
            {selectedDoc && (
                <div className="modal-overlay glass-blur" onClick={() => setSelectedDoc(null)}>
                    <div className="modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{selectedDoc.title}</h3>
                            <button className="modal-close" onClick={() => setSelectedDoc(null)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ textAlign: 'center' }}>
                            <img src={selectedDoc.url} alt={selectedDoc.title} style={{ maxWidth: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-premium)' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejecting && (
                <div className="modal-overlay glass-blur" onClick={() => setRejecting(null)}>
                    <div className="modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Từ chối xác minh</h3>
                            <button className="modal-close" onClick={() => setRejecting(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <label className="form-label">Lý do từ chối</label>
                            <textarea 
                                className="form-input" 
                                placeholder="VD: Ảnh mờ, CCCD hết hạn..." 
                                value={reason} 
                                onChange={e => setReason(e.target.value)}
                                style={{ height: '120px' }}
                            />
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setRejecting(null)}>Hủy</button>
                            <button className="btn" onClick={() => handleAction(rejecting, 'REJECTED')} disabled={!reason || saving} style={{ background: 'var(--danger-color)', color: 'white' }}>
                                {saving ? 'Đang lưu...' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .doc-chip {
                    padding: 4px 10px;
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary-color);
                    border: 1px solid rgba(var(--primary-rgb), 0.2);
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .doc-chip:hover {
                    background: var(--primary-color);
                    color: white;
                }
            `}</style>
        </div>
    );
}
