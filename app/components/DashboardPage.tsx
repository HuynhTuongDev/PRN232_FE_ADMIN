'use client';

import { useEffect, useState } from 'react';
import { motorbikeApi, rentalApi, userApi, blogApi, promotionApi, formatPrice } from '../utils/api';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalMotorbikes: 0,
        totalUsers: 0,
        totalRentals: 0,
        totalBlogs: 0,
        totalPromotions: 0,
        availableMotorbikes: 0,
        pendingRentals: 0,
        revenue: 0,
    });
    const [recentRentals, setRecentRentals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [motorbikeRes, userRes, rentalRes, blogRes, promoRes] = await Promise.all([
                motorbikeApi.getAll(),
                userApi.getAll(1),
                rentalApi.getAll(1),
                blogApi.getAll(),
                promotionApi.getAll(),
            ]);

            const motorbikes = motorbikeRes?.data?.motorbikes || [];
            const users = userRes?.data?.users || [];
            const rentals = rentalRes?.data?.rentals || [];
            const blogs = blogRes?.data || [];
            const promos = promoRes?.data || [];

            const available = motorbikes.filter((m: any) => m.status === 'AVAILABLE').length;
            const pending = rentals.filter((r: any) => r.status === 'PENDING').length;
            const revenue = rentals
                .filter((r: any) => r.status === 'COMPLETED')
                .reduce((sum: number, r: any) => sum + parseFloat(r.totalPrice || '0'), 0);

            setStats({
                totalMotorbikes: motorbikeRes?.data?.total || motorbikes.length,
                totalUsers: userRes?.data?.total || users.length,
                totalRentals: rentalRes?.data?.total || rentals.length,
                totalBlogs: blogs.length,
                totalPromotions: promos.length,
                availableMotorbikes: available,
                pendingRentals: pending,
                revenue,
            });

            setRecentRentals(rentals.slice(0, 5));
        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const rentalStatusBadge = (status: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            PENDING: { label: 'Chờ xác nhận', cls: 'warning' },
            CONFIRMED: { label: 'Đã xác nhận', cls: 'info' },
            ONGOING: { label: 'Đang thuê', cls: 'purple' },
            COMPLETED: { label: 'Hoàn thành', cls: 'success' },
            CANCELLED: { label: 'Đã hủy', cls: 'error' },
        };
        const s = map[status] || { label: status, cls: 'neutral' };
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div id="dashboard-page" className="animate-fade-in">
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tổng quan</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Chào mừng bạn quay lại! Dưới đây là tình hình kinh doanh hôm nay.</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="stat-card glass-card">
                    <div className="stat-info">
                        <h3 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>Tổng xe hợp tác</h3>
                        <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalMotorbikes}</div>
                        <div className="stat-change" style={{ color: '#10b981', marginTop: '16px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="status-dot online"></span>
                            {stats.availableMotorbikes} xe đang có sẵn
                        </div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></svg>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-info">
                        <h3 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>Đơn đặt xe</h3>
                        <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{stats.totalRentals}</div>
                        <div className="stat-change" style={{ color: '#3b82f6', marginTop: '16px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                            {stats.pendingRentals} đơn mới hôm nay
                        </div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-info">
                        <h3 style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', opacity: 0.6, marginBottom: '12px' }}>Doanh thu ước tính</h3>
                        <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.5 }}>{formatPrice(stats.revenue)}</div>
                        <div className="stat-change" style={{ color: '#f59e0b', marginTop: '8px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            Từ đơn hoàn thành
                        </div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                </div>
            </div>

            {/* Recent Rentals & Additional Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '24px' }}>
                <div className="table-container glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div className="table-header">
                        <h3 className="table-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Đơn thuê gần đây</h3>
                    </div>
                    {recentRentals.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ paddingLeft: '24px' }}>Khách hàng</th>
                                        <th>Xe</th>
                                        <th>Tổng tiền</th>
                                        <th style={{ paddingRight: '24px' }}>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentRentals.map((rental: any) => (
                                        <tr key={rental.id}>
                                            <td style={{ paddingLeft: '24px' }}>
                                                <div className="user-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="user-avatar-sm" style={{
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        background: 'var(--primary-500)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '10px', fontWeight: 'bold', color: 'white'
                                                    }}>{rental.user?.name?.charAt(0) || 'U'}</div>
                                                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{rental.user?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '13px' }}>{rental.motorbike?.name || 'N/A'}</td>
                                            <td style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '13px' }}>{formatPrice(rental.totalPrice || 0)}</td>
                                            <td style={{ paddingRight: '24px' }}>{rentalStatusBadge(rental.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>Chưa có dữ liệu</div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f43f5e' }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            Nội dung
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalBlogs}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>bài viết mới</span>
                        </div>
                        <div style={{ marginTop: '12px', height: '4px', background: 'var(--surface-bg)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '70%', height: '100%', background: '#f43f5e', borderRadius: '2px' }}></div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}><path d="M20 12V8H4v4" /><path d="M2 12h20" /><path d="M20 12v8H4v-8" /><path d="m12 8 4-4" /><path d="m12 8-4-4" /></svg>
                            Chiến dịch
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalPromotions}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ưu đãi đang chạy</span>
                        </div>
                        <div style={{ marginTop: '12px', height: '4px', background: 'var(--surface-bg)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '45%', height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
