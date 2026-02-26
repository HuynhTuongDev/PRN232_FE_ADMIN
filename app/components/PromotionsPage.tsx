'use client';

import { useEffect, useState } from 'react';
import { promotionApi, formatDate } from '../utils/api';

interface PromotionsPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface PromoForm {
    title: string;
    description: string;
    image: string;
    badge: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
}

const emptyForm: PromoForm = {
    title: '',
    description: '',
    image: '',
    badge: '',
    isActive: true,
    startDate: '',
    endDate: '',
};

export default function PromotionsPage({ onToast }: PromotionsPageProps) {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<PromoForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const res = await promotionApi.getAll();
            if (res.success) {
                setPromotions(res.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPromotions(); }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (promo: any) => {
        setEditingId(promo.id);
        setForm({
            title: promo.title || '',
            description: promo.description || '',
            image: promo.image || '',
            badge: promo.badge || '',
            isActive: promo.isActive ?? true,
            startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
            endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.description || !form.image) {
            onToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'warning');
            return;
        }
        setSaving(true);
        try {
            const payload: any = {
                title: form.title,
                description: form.description,
                image: form.image,
                badge: form.badge || undefined,
                isActive: form.isActive,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
                endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            };

            let res;
            if (editingId) {
                res = await promotionApi.update(editingId, payload);
            } else {
                res = await promotionApi.create(payload);
            }
            if (res.success) {
                onToast(editingId ? 'Cập nhật ưu đãi thành công!' : 'Tạo ưu đãi mới thành công!', 'success');
                setShowModal(false);
                loadPromotions();
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
            const res = await promotionApi.delete(deleteId);
            if (res.success) {
                onToast('Xóa ưu đãi thành công!', 'success');
                setDeleteId(null);
                loadPromotions();
            } else {
                onToast(res.error || 'Xóa thất bại', 'error');
            }
        } catch {
            onToast('Không thể kết nối server', 'error');
        }
    };

    return (
        <div id="promotions-page">
            <div className="page-header">
                <div className="page-header-info">
                    <h2>Quản lý ưu đãi</h2>
                    <p>Tổng cộng {promotions.length} chương trình ưu đãi</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate} id="btn-add-promotion">
                    <span>+</span> Tạo ưu đãi
                </button>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">Danh sách ưu đãi</h3>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : promotions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🎉</div>
                        <h3>Chưa có ưu đãi nào</h3>
                        <p>Nhấn &quot;Tạo ưu đãi&quot; để bắt đầu</p>
                    </div>
                ) : (
                    <table className="data-table" id="promotion-table">
                        <thead>
                            <tr>
                                <th>Ưu đãi</th>
                                <th>Badge</th>
                                <th>Trạng thái</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map((p: any) => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="motorbike-info">
                                            {p.image ? (
                                                <img src={p.image} alt={p.title} className="motorbike-thumb" />
                                            ) : (
                                                <div className="motorbike-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎉</div>
                                            )}
                                            <div>
                                                <div className="motorbike-name">{p.title}</div>
                                                <div className="motorbike-plate" style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{p.badge ? <span className="badge warning" style={{ fontSize: '11px', fontWeight: 800 }}>{p.badge}</span> : '—'}</td>
                                    <td>
                                        {p.isActive ? (
                                            <span className="badge success"><span className="status-dot online"></span>Hoạt động</span>
                                        ) : (
                                            <span className="badge neutral"><span className="status-dot offline"></span>Tắt</span>
                                        )}
                                    </td>
                                    <td>{p.startDate ? formatDate(p.startDate) : '—'}</td>
                                    <td>{p.endDate ? formatDate(p.endDate) : '—'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button className="action-btn edit" onClick={() => openEdit(p)} title="Sửa">✏️</button>
                                            <button className="action-btn delete" onClick={() => setDeleteId(p.id)} title="Xóa">🗑️</button>
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
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingId ? 'Chỉnh sửa ưu đãi' : 'Tạo ưu đãi mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tiêu đề *</label>
                                <input className="form-input" placeholder="VD: Chào bạn mới" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Badge</label>
                                    <input className="form-input" placeholder='VD: 20% OFF' value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Trạng thái</label>
                                    <select className="form-select" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                                        <option value="true">Hoạt động</option>
                                        <option value="false">Tắt</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">URL Hình ảnh *</label>
                                <input className="form-input" placeholder="https://example.com/promo.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Ngày bắt đầu</label>
                                    <input className="form-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ngày kết thúc</label>
                                    <input className="form-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mô tả *</label>
                                <textarea className="form-textarea" placeholder="Mô tả nội dung ưu đãi..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="btn-save-promotion">
                                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo ưu đãi')}
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
                            <div className="confirm-icon danger">🎉</div>
                            <h3>Xác nhận xóa ưu đãi?</h3>
                            <p>Chương trình ưu đãi sẽ bị xóa vĩnh viễn.</p>
                            <div className="confirm-actions">
                                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" onClick={handleDelete} id="btn-confirm-delete-promotion">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
