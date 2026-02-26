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
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.content || !form.image) {
            onToast('Vui lòng điền đầy đủ tiêu đề, nội dung và hình ảnh', 'warning');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form };
            let res;
            if (editingId) {
                res = await blogApi.update(editingId, payload);
            } else {
                res = await blogApi.create(payload);
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
        <div id="blogs-page">
            <div className="page-header">
                <div className="page-header-info">
                    <h2>Quản lý bài viết</h2>
                    <p>Tổng cộng {blogs.length} bài viết</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate} id="btn-add-blog">
                    <span>+</span> Tạo bài viết
                </button>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">Danh sách bài viết</h3>
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
                                <th>Bài viết</th>
                                <th>Thẻ</th>
                                <th>Tác giả</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((b: any) => (
                                <tr key={b.id}>
                                    <td>
                                        <div className="motorbike-info">
                                            {b.image ? (
                                                <img src={b.image} alt={b.title} className="motorbike-thumb" />
                                            ) : (
                                                <div className="motorbike-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📝</div>
                                            )}
                                            <div>
                                                <div className="motorbike-name" style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                                                <div className="motorbike-plate" style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.description || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{b.tag ? <span className="badge info">{b.tag}</span> : '—'}</td>
                                    <td>{b.author || 'Admin'}</td>
                                    <td>{formatDate(b.createdAt)}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button className="action-btn edit" onClick={() => openEdit(b)} title="Sửa">✏️</button>
                                            <button className="action-btn delete" onClick={() => setDeleteId(b.id)} title="Xóa">🗑️</button>
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
                            <h3 className="modal-title">{editingId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tiêu đề *</label>
                                <input className="form-input" placeholder="Tiêu đề bài viết" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Thẻ (Tag)</label>
                                    <input className="form-input" placeholder="VD: Kinh nghiệm, Cẩm nang" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tác giả</label>
                                    <input className="form-input" placeholder="Admin" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">URL Hình ảnh *</label>
                                <input className="form-input" placeholder="https://example.com/image.jpg" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tóm tắt</label>
                                <textarea className="form-textarea" placeholder="Tóm tắt ngắn gọn..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: '70px' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nội dung chi tiết *</label>
                                <textarea className="form-textarea" placeholder="Nội dung bài viết..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ minHeight: '140px' }} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="btn-save-blog">
                                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo bài viết')}
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
                            <div className="confirm-icon danger">📝</div>
                            <h3>Xác nhận xóa bài viết?</h3>
                            <p>Bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
                            <div className="confirm-actions">
                                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Hủy</button>
                                <button className="btn btn-danger" onClick={handleDelete} id="btn-confirm-delete-blog">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
