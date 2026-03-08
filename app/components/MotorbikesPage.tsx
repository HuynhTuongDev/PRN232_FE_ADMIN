'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    motorbikeApi,
    formatPrice,
    formatDate,
    motorbikeStatusMap,
    motorbikeTypeMap,
} from '../utils/api';

interface MotorbikeForm {
    name: string;
    type: string;
    pricePerDay: string;
    description: string;
    licensePlate: string;
    year: string;
    images: string;
    fuelCapacity: string;
    engineSize: string;
    status: string;
}

const emptyForm: MotorbikeForm = {
    name: '',
    type: 'SCOOTER',
    pricePerDay: '',
    description: '',
    licensePlate: '',
    year: '',
    images: '',
    fuelCapacity: '',
    engineSize: '',
    status: 'AVAILABLE',
};

interface MotorbikesPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function MotorbikesPage({ onToast }: MotorbikesPageProps) {
    const [motorbikes, setMotorbikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<MotorbikeForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const loadMotorbikes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await motorbikeApi.getAll({
                page,
                limit,
                type: filterType || undefined,
                status: filterStatus || undefined,
                search: search || undefined,
            });
            if (res.success && res.data) {
                setMotorbikes(res.data.motorbikes || []);
                setTotal(res.data.total || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, filterType, filterStatus, search]);

    useEffect(() => {
        loadMotorbikes();
    }, [loadMotorbikes]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setSelectedFiles(null);
        setShowModal(true);
    };

    const openEdit = (motorbike: any) => {
        setEditingId(motorbike.id);
        setForm({
            name: motorbike.name || '',
            type: motorbike.type || 'SCOOTER',
            pricePerDay: motorbike.pricePerDay?.toString() || '',
            description: motorbike.description || '',
            licensePlate: motorbike.licensePlate || '',
            year: motorbike.year?.toString() || '',
            images: (motorbike.images || []).join(', '),
            fuelCapacity: motorbike.fuelCapacity || '',
            engineSize: motorbike.engineSize || '',
            status: motorbike.status || 'AVAILABLE',
        });
        setSelectedFiles(null);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.licensePlate || !form.pricePerDay) {
            onToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('type', form.type);
            formData.append('pricePerDay', form.pricePerDay);
            if (form.description) formData.append('description', form.description);
            formData.append('licensePlate', form.licensePlate);
            if (form.year) formData.append('year', form.year);
            formData.append('status', form.status);
            if (form.fuelCapacity) formData.append('fuelCapacity', form.fuelCapacity);
            if (form.engineSize) formData.append('engineSize', form.engineSize);

            // Add existing images if any
            if (form.images) {
                const existingImages = form.images.split(',').map((s: string) => s.trim()).filter(Boolean);
                existingImages.forEach(img => formData.append('images', img));
            }

            // Add new files
            if (selectedFiles) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    formData.append('files', selectedFiles[i]);
                }
            }

            let res;
            if (editingId) {
                res = await motorbikeApi.update(editingId, formData);
            } else {
                res = await motorbikeApi.create(formData);
            }

            if (res.success) {
                onToast(editingId ? 'Cập nhật xe thành công!' : 'Thêm xe mới thành công!', 'success');
                setShowModal(false);
                loadMotorbikes();
            } else {
                onToast(res.error || res.message || 'Có lỗi xảy ra', 'error');
            }
        } catch (error) {
            onToast('Không thể kết nối server', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await motorbikeApi.delete(deleteId);
            if (res.success) {
                onToast('Xóa xe thành công!', 'success');
                setDeleteId(null);
                loadMotorbikes();
            } else {
                onToast(res.error || 'Xóa thất bại', 'error');
            }
        } catch {
            onToast('Không thể kết nối server', 'error');
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div id="motorbikes-page">
            <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="page-header-info">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quản lý xe máy</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tổng cộng {total} xe trong hệ thống</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate} id="btn-add-motorbike" style={{ borderRadius: 'var(--radius-md)', padding: '10px 24px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Thêm xe mới
                </button>
            </div>

            {/* Table */}
            <div className="table-container glass-card" style={{ padding: '0' }}>
                <div className="table-header" style={{ padding: '20px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div className="table-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div className="search-input-wrapper" style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Tìm kiếm xe..."
                                style={{ width: '100%', paddingLeft: '40px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }}
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                id="search-motorbike"
                            />
                        </div>
                        <select className="form-select" style={{ width: 'auto', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} id="filter-motorbike-type">
                            <option value="">Tất cả loại xe</option>
                            <option value="MANUAL">Xe số</option>
                            <option value="SCOOTER">Xe ga</option>
                            <option value="SEMI_AUTO">Xe côn</option>
                        </select>
                        <select className="form-select" style={{ width: 'auto', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} id="filter-motorbike-status">
                            <option value="">Tất cả trạng thái</option>
                            <option value="AVAILABLE">Có sẵn</option>
                            <option value="RENTED">Đang thuê</option>
                            <option value="MAINTENANCE">Bảo trì</option>
                            <option value="UNAVAILABLE">Không khả dụng</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : motorbikes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏍️</div>
                        <h3>Chưa có xe nào</h3>
                        <p>Nhấn &quot;Thêm xe mới&quot; để bắt đầu</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table" id="motorbike-table">
                            <thead>
                                <tr>
                                    <th>Thông tin xe</th>
                                    <th>Loại</th>
                                    <th>Giá/ngày</th>
                                    <th>Trạng thái</th>
                                    <th>Chi tiết</th>
                                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {motorbikes.map((m: any) => {
                                    const statusInfo = motorbikeStatusMap[m.status] || { label: m.status, badge: 'neutral' };
                                    return (
                                        <tr key={m.id}>
                                            <td>
                                                <div className="motorbike-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    {m.images?.[0] ? (
                                                        <img src={m.images[0]} alt={m.name} className="motorbike-thumb" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                                                    ) : (
                                                        <div className="motorbike-thumb" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>\uD83C\uDFCD️</div>
                                                    )}
                                                    <div>
                                                        <div className="motorbike-name" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                                                        <div className="motorbike-plate" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.licensePlate}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span style={{ fontSize: '13px' }}>{motorbikeTypeMap[m.type] || m.type}</span></td>
                                            <td className="price" style={{ fontWeight: 600, color: 'var(--primary-500)' }}>{formatPrice(m.pricePerDay)}</td>
                                            <td><span className={`badge ${statusInfo.badge}`}><span className={`status-dot ${statusInfo.badge === 'success' ? 'online' : statusInfo.badge === 'warning' ? 'warning' : 'offline'}`}></span>{statusInfo.label}</span></td>
                                            <td>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    <div>Năm: {m.year || 'N/A'}</div>
                                                    <div>Tạo: {formatDate(m.createdAt)}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-cell" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button className="btn-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }} onClick={() => openEdit(m)} title="Sửa">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    </button>
                                                    <button className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={() => setDeleteId(m.id)} title="Xóa">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <div className="pagination-info">Trang {page} / {totalPages} • Tổng {total} xe</div>
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay glass-blur" onClick={() => setShowModal(false)} style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', padding: '0', border: '1px solid rgba(0, 0, 0, 0.05)', background: '#fff', boxShadow: 'var(--shadow-premium)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ opacity: 0.5 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tên xe *</label>
                                    <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} placeholder="VD: Honda SH 150i" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Biển số xe *</label>
                                    <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} placeholder="VD: 29A-123.45" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Loại xe</label>
                                    <select className="form-select" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                        <option value="SCOOTER">Xe ga</option>
                                        <option value="MANUAL">Xe số</option>
                                        <option value="SEMI_AUTO">Xe côn</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Giá thuê/ngày (VNĐ) *</label>
                                    <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} type="number" placeholder="150000" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Năm sản xuất</label>
                                    <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} type="number" placeholder="2023" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Trạng thái</label>
                                    <select className="form-select" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                        <option value="AVAILABLE">Có sẵn</option>
                                        <option value="RENTED">Đang thuê</option>
                                        <option value="MAINTENANCE">Bảo trì</option>
                                        <option value="UNAVAILABLE">Không khả dụng</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Dung tích bình xăng</label>
                                    <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} placeholder="VD: 4.0 L" value={form.fuelCapacity} onChange={(e) => setForm({ ...form, fuelCapacity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Dung tích động cơ</label>
                                    <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} placeholder="VD: 150cc" value={form.engineSize} onChange={(e) => setForm({ ...form, engineSize: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tải lên hình ảnh (Chọn tối đa 10 ảnh)</label>
                                <input
                                    type="file"
                                    className="form-input"
                                    multiple
                                    accept="image/*"
                                    style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }}
                                    onChange={(e) => setSelectedFiles(e.target.files)}
                                    id="input-file-motorbike"
                                />
                                {selectedFiles && selectedFiles.length > 0 && (
                                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--primary)' }}>
                                        {selectedFiles.length} file đã chọn
                                    </div>
                                )}
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Hoặc URL Hình ảnh (cách nhau bởi dấu phẩy)</label>
                                <input className="form-input" style={{ width: '100%', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', color: 'var(--text-primary)' }} placeholder="https://example.com/image1.jpg, https://..." value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Mô tả</label>
                                <textarea className="form-textarea" style={{ width: '100%', minHeight: '100px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', padding: '12px', color: 'var(--text-primary)' }} placeholder="Mô tả chi tiết về xe..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: 'var(--radius-md)' }}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="btn-save-motorbike" style={{ borderRadius: 'var(--radius-md)' }}>
                                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm xe')}
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
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Xác nhận xóa xe?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>Hành động này không thể hoàn tác. Xe sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                            <div className="confirm-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, borderRadius: 'var(--radius-md)' }} onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" style={{ flex: 1, borderRadius: 'var(--radius-md)' }} onClick={handleDelete} id="btn-confirm-delete-motorbike">Xóa xe</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
