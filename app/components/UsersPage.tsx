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
            const res = await userApi.getAll(page, limit, search || undefined);
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
        <div id="users-page">
            <div className="page-header">
                <div className="page-header-info">
                    <h2>Quản lý người dùng</h2>
                    <p>Tổng cộng {total} tài khoản trong hệ thống</p>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">Danh sách người dùng</h3>
                    <div className="table-actions">
                        <div className="search-input-wrapper">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Tìm theo tên, email..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                id="search-user"
                            />
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
                                    <th>Người dùng</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th>Địa chỉ</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u: any) => {
                                    const roleInfo = userRoleMap[u.role] || { label: u.role, badge: 'neutral' };
                                    return (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className={`user-avatar-sm ${u.role === 'ADMIN' ? 'admin' : 'customer'}`}>
                                                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="user-name">{u.name}</div>
                                                        <div className="user-email">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{u.phone || '—'}</td>
                                            <td><span className={`badge ${roleInfo.badge}`}>{roleInfo.label}</span></td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                                            <td>{formatDate(u.createdAt)}</td>
                                            <td>
                                                <div className="action-cell">
                                                    <button className="action-btn edit" onClick={() => openEdit(u)} title="Sửa">✏️</button>
                                                    <button className="action-btn delete" onClick={() => setDeleteId(u.id)} title="Xóa">🗑️</button>
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
                <div className="modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Chỉnh sửa người dùng</h3>
                            <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" value={editModal.email} disabled style={{ opacity: 0.6 }} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Tên</label>
                                    <input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Số điện thoại</label>
                                    <input className="form-input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Địa chỉ</label>
                                <input className="form-input" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Vai trò</label>
                                <select className="form-select" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                                    <option value="CUSTOMER">Khách hàng</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleUpdate} disabled={saving} id="btn-save-user">
                                {saving ? 'Đang lưu...' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-body">
                            <div className="confirm-icon danger">👤</div>
                            <h3>Xác nhận xóa người dùng?</h3>
                            <p>Hành động này không thể hoàn tác. Tài khoản sẽ bị xóa vĩnh viễn.</p>
                            <div className="confirm-actions">
                                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" onClick={handleDelete} id="btn-confirm-delete-user">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
