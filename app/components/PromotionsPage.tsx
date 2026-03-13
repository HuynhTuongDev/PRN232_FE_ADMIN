'use client';

import { useEffect, useState } from 'react';
import { promotionApi, formatDate } from '../utils/api';

interface PromotionsPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface PromoForm {
    title: string;
    description: string;
    code: string;
    discountType: string;
    discountValue: string;
    minOrderValue: string;
    image: string;
    badge: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
}

const emptyForm: PromoForm = {
    title: '',
    description: '',
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '0',
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        setSelectedFile(null);
        setShowModal(true);
    };

    const openEdit = (promo: any) => {
        setEditingId(promo.id);
        setForm({
            title: promo.title || '',
            description: promo.description || '',
            code: promo.code || '',
            discountType: promo.discountType || 'PERCENTAGE',
            discountValue: promo.discountValue?.toString() || '',
            minOrderValue: promo.minOrderValue?.toString() || '0',
            image: promo.image || '',
            badge: promo.badge || '',
            isActive: promo.isActive ?? true,
            startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
            endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
        });
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.description || (!form.image && !selectedFile)) {
            onToast('Vui lòng điền đầy đủ thông tin bắt buộc và hình ảnh', 'warning');
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('code', form.code);
            formData.append('discountType', form.discountType);
            formData.append('discountValue', form.discountValue);
            formData.append('minOrderValue', form.minOrderValue);
            if (form.image) formData.append('image', form.image);
            if (form.badge) formData.append('badge', form.badge);
            formData.append('isActive', form.isActive.toString());
            if (form.startDate) formData.append('startDate', new Date(form.startDate).toISOString());
            if (form.endDate) formData.append('endDate', new Date(form.endDate).toISOString());

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            let res;
            if (editingId) {
                res = await promotionApi.update(editingId, formData);
            } else {
                res = await promotionApi.create(formData);
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
        <div id="promotions-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="page-header-info">
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ưu đãi</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Quản lý các chương trình khuyến mãi và mã giảm giá</p>
                </div>
                <button className="btn btn-primary glass-effect" onClick={openCreate} id="btn-add-promotion" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, border: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tạo ưu đãi
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-header" style={{ padding: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.01)' }}>
                    <h3 className="table-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        Danh sách ưu đãi ({promotions.length})
                    </h3>
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
                                <th style={{ paddingLeft: '24px' }}>Chương trình</th>
                                <th>Mức ưu đãi</th>
                                <th>Trạng thái</th>
                                <th>Thời gian</th>
                                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map((p: any) => (
                                <tr key={p.id} className="hover-row">
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div className="motorbike-info">
                                            {p.image ? (
                                                <img src={p.image} alt={p.title} className="motorbike-thumb" style={{ borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)' }} />
                                            ) : (
                                                <div className="motorbike-thumb glass-effect" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', borderRadius: '10px', background: 'rgba(0,0,0,0.03)' }}>🎉</div>
                                            )}
                                            <div>
                                                <div className="motorbike-name" style={{ fontWeight: 600 }}>{p.title}</div>
                                                <div className="motorbike-plate" style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', opacity: 0.6 }}>{p.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {p.badge ? (
                                            <span className="badge warning" style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 800, 
                                                padding: '4px 12px', 
                                                borderRadius: '20px',
                                                background: 'rgba(245, 158, 11, 0.1)',
                                                color: '#f59e0b',
                                                border: '1px solid rgba(245, 158, 11, 0.2)'
                                            }}>
                                                {p.badge}
                                            </span>
                                        ) : (
                                            <span style={{ opacity: 0.3 }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        {p.isActive ? (
                                            <span className="badge success" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <span className="status-dot online"></span>Hoạt động
                                            </span>
                                        ) : (
                                            <span className="badge neutral" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <span className="status-dot offline"></span>Tắt
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ opacity: 0.5 }}>Từ:</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>{p.startDate ? formatDate(p.startDate) : 'N/A'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ opacity: 0.5 }}>Đến:</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>{p.endDate ? formatDate(p.endDate) : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ paddingRight: '24px' }}>
                                        <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                                            <button className="action-btn glass-effect" onClick={() => openEdit(p)} title="Sửa" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </button>
                                            <button className="action-btn glass-effect delete" onClick={() => setDeleteId(p.id)} title="Xóa" style={{ width: '36px', height: '36px', borderRadius: '10px', color: '#f87171' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
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
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Chỉnh sửa ưu đãi' : 'Tạo ưu đãi mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ opacity: 0.5 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tiêu đề *</label>
                                    <input className="form-input" placeholder="VD: Khuyến mãi mùa hè 2024" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Mã Ưu đãi (Voucher) *</label>
                                    <input className="form-input" placeholder="VD: SUMMER20" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)', fontWeight: 700 }} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Loại giảm giá</label>
                                    <select className="form-select" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                                        <option value="PERCENTAGE">Phần trăm (%)</option>
                                        <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Giá trị giảm *</label>
                                    <input className="form-input" type="number" placeholder="VD: 20 hoặc 50000" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Đơn tối thiểu</label>
                                    <input className="form-input" type="number" placeholder="0" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Badge (VD: 20% OFF)</label>
                                    <input className="form-input" placeholder="Nhập nhãn nổi bật..." style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Trạng thái</label>
                                    <select className="form-select" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                                        <option value="true">Hoạt động</option>
                                        <option value="false">Tạm tắt</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tải lên hình ảnh</label>
                                <input
                                    type="file"
                                    className="form-input"
                                    accept="image/*"
                                    style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }}
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    id="input-file-promotion"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Hoặc URL Hình ảnh</label>
                                <input className="form-input" placeholder="https://example.com/promo.jpg" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Ngày bắt đầu</label>
                                    <input className="form-input" type="date" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Ngày kết thúc</label>
                                    <input className="form-input" type="date" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Mô tả ngắn *</label>
                                <textarea className="form-textarea" placeholder="Nội dung khuyến mãi chi tiết..." value={form.description} style={{ width: '100%', minHeight: '100px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)' }} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="btn-save-promotion" style={{ borderRadius: '10px', padding: '10px 24px' }}>
                                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo ưu đãi')}
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
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Xóa chương trình ưu đãi?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>Thông tin ưu đãi sẽ bị gỡ bỏ vĩnh viễn khỏi danh sách hiển thị.</p>
                            <div className="confirm-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, borderRadius: '10px' }} onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" style={{ flex: 1, borderRadius: '10px' }} onClick={handleDelete} id="btn-confirm-delete-promotion">Xóa ngay</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
