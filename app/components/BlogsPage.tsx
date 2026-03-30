'use client';

import { useEffect, useState } from 'react';
import { blogApi, formatDate } from '../utils/api';

interface BlogsPageProps {
    onToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}


interface BlogForm {
    title: string;
    description: string;
    content: string;
    image: string;
    tag: string;
    author: string;
}

const emptyForm: BlogForm = {
    title: '',
    description: '',
    content: '',
    image: '',
    tag: '',
    author: 'Admin',
};

export default function BlogsPage({ onToast }: BlogsPageProps) {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<BlogForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const loadBlogs = async () => {
        setLoading(true);
        try {
            const res = await blogApi.getAll();
            if (res.success) {
                setBlogs(res.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBlogs(); }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setSelectedFile(null);
        setShowModal(true);
    };

    const openEdit = (blog: any) => {
        setEditingId(blog.id);
        setForm({
            title: blog.title || '',
            description: blog.description || '',
            content: blog.content || '',
            image: blog.image || '',
            tag: blog.tag || '',
            author: blog.author || 'Admin',
        });
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.content || (!form.image && !selectedFile)) {
            onToast('Vui lòng điền đầy đủ tiêu đề, nội dung và hình ảnh', 'warning');
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('content', form.content);
            if (form.description) formData.append('description', form.description);
            if (form.tag) formData.append('tag', form.tag);
            if (form.author) formData.append('author', form.author);
            if (form.image) formData.append('image', form.image);

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            let res;
            if (editingId) {
                res = await blogApi.update(editingId, formData);
            } else {
                res = await blogApi.create(formData);
            }
            if (res.success) {
                onToast(editingId ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết mới thành công!', 'success');
                setShowModal(false);
                loadBlogs();
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
            const res = await blogApi.delete(deleteId);
            if (res.success) {
                onToast('Xóa bài viết thành công!', 'success');
                setDeleteId(null);
                loadBlogs();
            } else {
                onToast(res.error || 'Xóa thất bại', 'error');
            }
        } catch {
            onToast('Không thể kết nối server', 'error');
        }
    };

    return (
        <div id="blogs-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="page-header-info">
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bài viết</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Quản lý nội dung tin tức và chia sẻ kinh nghiệm</p>
                </div>
                <button className="btn btn-primary glass-effect" onClick={openCreate} id="btn-add-blog" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, border: 'none' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Tạo bài viết
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-header" style={{ padding: '24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.01)' }}>
                    <h3 className="table-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        Danh sách bài viết ({blogs.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : blogs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <h3>Chưa có bài viết nào</h3>
                        <p>Nhấn &quot;Tạo bài viết&quot; để bắt đầu</p>
                    </div>
                ) : (
                    <table className="data-table" id="blog-table">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Bài viết</th>
                                <th>Chủ đề</th>
                                <th>Tác giả</th>
                                <th>Ngày đăng</th>
                                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((b: any) => (
                                <tr key={b.id} className="hover-row">
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div className="motorbike-info">
                                            {b.image ? (
                                                <img src={b.image} alt={b.title} className="motorbike-thumb" style={{ borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)' }} />
                                            ) : (
                                                <div className="motorbike-thumb glass-effect" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', borderRadius: '10px', background: 'rgba(0,0,0,0.03)' }}>📝</div>
                                            )}
                                            <div>
                                                <div className="motorbike-name" style={{ maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{b.title}</div>
                                                <div className="motorbike-plate" style={{ maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', opacity: 0.6 }}>{b.description || 'Không có mô tả'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {b.tag ? (
                                            <span className="badge info" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                                {b.tag}
                                            </span>
                                        ) : (
                                            <span style={{ opacity: 0.3 }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color) 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                                                {(b.author || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '13px' }}>{b.author || 'Admin'}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{formatDate(b.createdAt)}</td>
                                    <td style={{ paddingRight: '24px' }}>
                                        <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                                            <button className="action-btn glass-effect" onClick={() => openEdit(b)} title="Sửa" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button className="action-btn glass-effect delete" onClick={() => setDeleteId(b.id)} title="Xóa" style={{ width: '36px', height: '36px', borderRadius: '10px', color: '#f87171' }}>
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
                    <div className="modal glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', padding: '0', border: '1px solid rgba(0, 0, 0, 0.05)', background: '#fff', boxShadow: 'var(--shadow-premium)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ opacity: 0.5 }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tiêu đề *</label>
                                <input className="form-input" placeholder="Nhập tiêu đề hấp dẫn..." style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Thẻ (Tag)</label>
                                    <input className="form-input" placeholder="Kinh nghiệm, Cẩm nang..." style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tác giả</label>
                                    <input className="form-input" placeholder="Admin" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
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
                                    id="input-file-blog"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Hoặc URL Hình ảnh</label>
                                <input className="form-input" placeholder="https://example.com/image.jpg" style={{ width: '100%', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)' }} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Tóm tắt</label>
                                <textarea className="form-textarea" placeholder="Mô tả ngắn gọn về nội dung bài viết..." value={form.description} style={{ width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)' }} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 500 }}>Nội dung chi tiết *</label>
                                <textarea className="form-textarea" placeholder="Viết nội dung bài viết tại đây..." value={form.content} style={{ width: '100%', minHeight: '180px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', lineHeight: '1.6' }} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: '10px' }}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="btn-save-blog" style={{ borderRadius: '10px', padding: '10px 24px' }}>
                                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Đăng bài viết')}
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
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Xóa bài viết này?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>Hành động này sẽ gỡ bài viết khỏi hệ thống vĩnh viễn.</p>
                            <div className="confirm-actions" style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, borderRadius: '10px' }} onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" style={{ flex: 1, borderRadius: '10px' }} onClick={handleDelete} id="btn-confirm-delete-blog">Xóa ngay</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
