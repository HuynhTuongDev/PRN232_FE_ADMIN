'use client';

import { useEffect, useState } from 'react';
import { locationApi } from '../utils/api';

interface LocationsPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface LocationForm {
    name: string;
    count: string;
    image: string;
}

const emptyForm: LocationForm = {
    name: '',
    count: '',
    image: '',
};

export default function LocationsPage({ onToast }: LocationsPageProps) {
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<LocationForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const loadLocations = async () => {
        setLoading(true);
        try {
            const res = await locationApi.getAll();
            if (res.success) {
                setLocations(res.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLocations(); }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (loc: any) => {
        setEditingId(loc.id);
        setForm({
            name: loc.name || '',
            count: loc.count || '',
            image: loc.image || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.count || !form.image) {
            onToast('Vui lòng điền đầy đủ thông tin bắt buộc và hình ảnh', 'warning');
            return;
        }
        setSaving(true);
        try {
            let res;
            if (editingId) {
                res = await locationApi.update(editingId, form);
            } else {
                res = await locationApi.create(form);
            }
            if (res.success) {
                onToast(editingId ? 'Cập nhật địa điểm thành công!' : 'Tạo địa điểm mới thành công!', 'success');
                setShowModal(false);
                loadLocations();
            } else {
                onToast(res.error || 'Có lỗi xảy ra', 'error');
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
            const res = await locationApi.delete(deleteId);
            if (res.success) {
                onToast('Xóa địa điểm thành công!', 'success');
                setDeleteId(null);
                loadLocations();
            } else {
                onToast(res.error || 'Xóa thất bại', 'error');
            }
        } catch {
            onToast('Không thể kết nối server', 'error');
        }
    };

    return (
        <div id="locations-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="page-header-info">
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Địa điểm</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Quản lý các địa điểm cho thuê xe</p>
                </div>
                <button className="btn btn-primary glass-effect" onClick={openCreate} id="btn-add-location" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, border: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Tạo địa điểm
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-header" style={{ padding: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.01)' }}>
                    <h3 className="table-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        Danh sách địa điểm ({locations.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : locations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📍</div>
                        <h3>Chưa có địa điểm nào</h3>
                        <p>Nhấn &quot;Tạo địa điểm&quot; để bắt đầu</p>
                    </div>
                ) : (
                    <table className="data-table" id="location-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Tên địa điểm</th>
                                <th>Số lượng / Mô tả</th>
                                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map((loc: any) => (
                                <tr key={loc.id} className="hover-row">
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div className="motorbike-info">
                                            {loc.image ? (
                                                <img src={loc.image} alt={loc.name} className="motorbike-thumb" style={{ borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)' }} />
                                            ) : (
                                                <div className="motorbike-thumb glass-effect" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', borderRadius: '10px', background: 'rgba(0,0,0,0.03)' }}>📍</div>
                                            )}
                                            <div>
                                                <div className="motorbike-name" style={{ fontWeight: 600 }}>{loc.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--text-secondary)' }}>{loc.count}</span>
                                    </td>
                                    <td style={{ paddingRight: '24px' }}>
                                        <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                                            <button className="action-btn glass-effect" onClick={() => openEdit(loc)} title="Sửa" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button className="action-btn glass-effect delete" onClick={() => setDeleteId(loc.id)} title="Xóa" style={{ width: '36px', height: '36px', borderRadius: '10px', color: '#f87171' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay glass-blur" onClick={() => setShowModal(false)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '0', border: '1px solid rgba(0, 0, 0, 0.05)', background: '#fff', boxShadow: 'var(--shadow-premium)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Chỉnh sửa địa điểm' : 'Tạo địa điểm mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ opacity: 0.5 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tên địa điểm *</label>
                                <input className="form-input" placeholder="VD: Trung tâm Quy Nhơn" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Số lượng / Mô tả *</label>
                                <input className="form-input" placeholder="VD: 100+ Xe sẵn sàng" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>URL Hình ảnh *</label>
                                <input className="form-input" placeholder="https://example.com/image.jpg" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="btn-save-location" style={{ borderRadius: '10px', padding: '10px 24px' }}>
                                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo địa điểm')}
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
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Xóa địa điểm?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>Xóa địa điểm sẽ không thể hoàn tác.</p>
                            <div className="confirm-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, borderRadius: '10px' }} onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" style={{ flex: 1, borderRadius: '10px' }} onClick={handleDelete} id="btn-confirm-delete-location">Xóa ngay</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
