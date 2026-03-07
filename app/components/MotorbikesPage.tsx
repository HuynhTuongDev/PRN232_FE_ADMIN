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
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-info">
                    <h2>Quản lý xe máy</h2>
                    <p>Tổng cộng {total} xe trong hệ thống</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate} id="btn-add-motorbike">
                    <span>+</span> Thêm xe mới
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <div className="table-actions">
                        <div className="search-input-wrapper">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Tìm kiếm xe..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                id="search-motorbike"
                            />
                        </div>
                        <select className="filter-select" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} id="filter-motorbike-type">
                            <option value="">Tất cả loại xe</option>
                            <option value="MANUAL">Xe số</option>
                            <option value="SCOOTER">Xe ga</option>
                            <option value="SEMI_AUTO">Xe côn</option>
                        </select>
                        <select className="filter-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} id="filter-motorbike-status">
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
                                    <th>Xe</th>
                                    <th>Loại</th>
                                    <th>Giá/ngày</th>
                                    <th>Trạng thái</th>
                                    <th>Năm SX</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {motorbikes.map((m: any) => {
                                    const statusInfo = motorbikeStatusMap[m.status] || { label: m.status, badge: 'neutral' };
                                    return (
                                        <tr key={m.id}>
                                            <td>
                                                <div className="motorbike-info">
                                                    {m.images?.[0] ? (
                                                        <img src={m.images[0]} alt={m.name} className="motorbike-thumb" />
                                                    ) : (
                                                        <div className="motorbike-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏍️</div>
                                                    )}
                                                    <div>
                                                        <div className="motorbike-name">{m.name}</div>
                                                        <div className="motorbike-plate">{m.licensePlate}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{motorbikeTypeMap[m.type] || m.type}</td>
                                            <td className="price">{formatPrice(m.pricePerDay)}</td>
                                            <td><span className={`badge ${statusInfo.badge}`}><span className={`status-dot ${statusInfo.badge === 'success' ? 'online' : statusInfo.badge === 'warning' ? 'warning' : 'offline'}`}></span>{statusInfo.label}</span></td>
                                            <td>{m.year || 'N/A'}</td>
                                            <td>{formatDate(m.createdAt)}</td>
                                            <td>
                                                <div className="action-cell">
                                                    <button className="action-btn edit" onClick={() => openEdit(m)} title="Sửa">✏️</button>
                                                    <button className="action-btn delete" onClick={() => setDeleteId(m.id)} title="Xóa">🗑️</button>
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
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingId ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Tên xe *</label>
                                    <input className="form-input" placeholder="VD: Honda SH 150i" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Biển số xe *</label>
                                    <input className="form-input" placeholder="VD: 29A-123.45" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Loại xe</label>
                                    <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                        <option value="SCOOTER">Xe ga</option>
                                        <option value="MANUAL">Xe số</option>
                                        <option value="SEMI_AUTO">Xe côn</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Giá thuê/ngày (VNĐ) *</label>
                                    <input className="form-input" type="number" placeholder="150000" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Năm sản xuất</label>
                                    <input className="form-input" type="number" placeholder="2023" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                        <option value="AVAILABLE">Có sẵn</option>
                                        <option value="RENTED">Đang thuê</option>
                                        <option value="MAINTENANCE">Bảo trì</option>
                                        <option value="UNAVAILABLE">Không khả dụng</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Dung tích bình xăng</label>
                                    <input className="form-input" placeholder="VD: 4.0 L" value={form.fuelCapacity} onChange={(e) => setForm({ ...form, fuelCapacity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dung tích động cơ</label>
                                    <input className="form-input" placeholder="VD: 150cc" value={form.engineSize} onChange={(e) => setForm({ ...form, engineSize: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tải lên hình ảnh (Chọn tối đa 10 ảnh)</label>
                                <input
                                    type="file"
                                    className="form-input"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setSelectedFiles(e.target.files)}
                                    id="input-file-motorbike"
                                />
                                {selectedFiles && selectedFiles.length > 0 && (
                                    <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--primary)' }}>
                                        {selectedFiles.length} file đã chọn
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hoặc URL Hình ảnh (cách nhau bởi dấu phẩy)</label>
                                <input className="form-input" placeholder="https://example.com/image1.jpg, https://..." value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <textarea className="form-textarea" placeholder="Mô tả chi tiết về xe..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="btn-save-motorbike">
                                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Thêm xe')}
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
                            <div className="confirm-icon danger">🗑️</div>
                            <h3>Xác nhận xóa xe?</h3>
                            <p>Hành động này không thể hoàn tác. Xe sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                            <div className="confirm-actions">
                                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" onClick={handleDelete} id="btn-confirm-delete-motorbike">Xóa xe</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
