'use client';

import { useEffect, useState, useCallback } from 'react';
import { userApi, formatDate, userRoleMap } from '../utils/api';

interface UsersPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function UsersPage({ onToast }: UsersPageProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [editModal, setEditModal] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', role: 'CUSTOMER' });
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const limit = 10;

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll(page, search || undefined);
            if (res.success && res.data) {
                setUsers(res.data.users || []);
                setTotal(res.data.total || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const openEdit = (user: any) => {
        setEditModal(user);
        setEditForm({
            name: user.name || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.role || 'CUSTOMER',
        });
    };

    const handleUpdate = async () => {
        if (!editModal) return;
        setSaving(true);
        try {
            const res = await userApi.update(editModal.id, editForm);
            if (res.success) {
                onToast('Cập nhật người dùng thành công!', 'success');
                setEditModal(null);
                loadUsers();
            } else {
                onToast(res.error || 'Cập nhật thất bại', 'error');
            }
        } catch {
            onToast('Không thể kết nối server', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await userApi.delete(deleteId);
            if (res.success) {
                onToast('Xóa người dùng thành công!', 'success');
                setDeleteId(null);
                loadUsers();
            } else {
                onToast(res.error || 'Xóa thất bại', 'error');
            }
        } catch {
            onToast('Không thể kết nối server', 'error');
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div id="users-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <div className="page-header-info">
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Người dùng</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Tổng cộng {total} tài khoản trong hệ thống</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-header" style={{ padding: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <h3 className="table-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Danh sách người dùng
                        </h3>
                        <div className="table-actions">
                            <div className="search-input-wrapper glass-effect" style={{ padding: '2px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', width: '300px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Tìm theo tên, email..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    id="search-user"
                                    style={{ border: 'none', background: 'transparent', padding: '10px 0', fontSize: '14px', width: '100%' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : users.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <h3>Chưa có người dùng nào</h3>
                        <p>Người dùng đăng ký sẽ xuất hiện ở đây</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table" id="user-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '24px' }}>Người dùng</th>
                                    <th>Thông tin liên hệ</th>
                                    <th>Vai trò</th>
                                    <th>Ngày tạo</th>
                                    <th style={{ paddingRight: '24px', textAlign: 'right' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u: any) => {
                                    const roleInfo = userRoleMap[u.role] || { label: u.role, badge: 'neutral' };
                                    const isAdmin = u.role === 'ADMIN';
                                    return (
                                        <tr key={u.id} className="hover-row">
                                            <td style={{ paddingLeft: '24px' }}>
                                                <div className="user-cell">
                                                    <div className="user-avatar-sm" style={{
                                                        background: isAdmin ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'linear-gradient(135deg, var(--primary-color) 0%, #a855f7 100%)',
                                                        color: '#fff',
                                                        fontWeight: 700,
                                                        fontSize: '14px'
                                                    }}>
                                                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="user-name" style={{ fontWeight: 600 }}>{u.name}</div>
                                                        <div className="user-email" style={{ fontSize: '12px', opacity: 0.6 }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '13px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                        <span>{u.phone || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || 'Hà Nội'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${roleInfo.badge}`} style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    {isAdmin && <span style={{ fontSize: '14px' }}>👑</span>}
                                                    {roleInfo.label}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{formatDate(u.createdAt)}</td>
                                            <td style={{ paddingRight: '24px' }}>
                                                <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                                                    <button className="action-btn glass-effect" onClick={() => openEdit(u)} title="Sửa" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    </button>
                                                    <button className="action-btn glass-effect delete" onClick={() => setDeleteId(u.id)} title="Xóa" style={{ width: '36px', height: '36px', borderRadius: '10px', color: '#f87171' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
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
                                <div className="pagination-info">Trang {page} / {totalPages} • Tổng {total} người dùng</div>
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

            {/* Edit User Modal */}
            {editModal && (
                <div className="modal-overlay glass-blur" onClick={() => setEditModal(null)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '0', border: '1px solid rgba(0, 0, 0, 0.05)', background: '#fff', boxShadow: 'var(--shadow-premium)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Cập nhật người dùng</h3>
                            <button className="modal-close" onClick={() => setEditModal(null)} style={{ opacity: 0.5 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Email</label>
                                <input className="form-input" value={editModal.email} disabled style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-secondary)' }} />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tên</label>
                                    <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Số điện thoại</label>
                                    <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Địa chỉ</label>
                                <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Vai trò</label>
                                <select className="form-select" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                                    <option value="CUSTOMER">Khách hàng</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setEditModal(null)} style={{ borderRadius: 'var(--radius-md)' }}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleUpdate} disabled={saving} id="btn-save-user" style={{ borderRadius: 'var(--radius-md)' }}>
                                {saving ? 'Đang lưu...' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteId && (
                <div className="modal-overlay glass-blur" onClick={() => setDeleteId(null)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal confirm-dialog glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(0, 0, 0, 0.05)', background: '#fff' }}>
                        <div className="modal-body" style={{ padding: '32px' }}>
                            <div className="confirm-icon danger" style={{ margin: '0 auto 20px', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><line x1="10" y1="11" x2="14" y2="11" /></svg>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Xác nhận xóa người dùng?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>Hành động này không thể hoàn tác. Tài khoản sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                            <div className="confirm-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, borderRadius: 'var(--radius-md)' }} onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" style={{ flex: 1, borderRadius: 'var(--radius-md)' }} onClick={handleDelete} id="btn-confirm-delete-user">Xóa ngay</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
