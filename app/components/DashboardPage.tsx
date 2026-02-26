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
                motorbikeApi.getAll({ limit: 100 }),
                userApi.getAll(1, 100),
                rentalApi.getAll(1, 100),
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
        <div id="dashboard-page">
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card emerald">
                    <div className="stat-info">
                        <h3>Tổng xe máy</h3>
                        <div className="stat-value">{stats.totalMotorbikes}</div>
                        <div className="stat-change positive">
                            <span>🟢</span> {stats.availableMotorbikes} xe có sẵn
                        </div>
                    </div>
                    <div className="stat-icon emerald">🏍️</div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-info">
                        <h3>Đơn thuê xe</h3>
                        <div className="stat-value">{stats.totalRentals}</div>
                        <div className="stat-change positive">
                            <span>⏳</span> {stats.pendingRentals} đang chờ
                        </div>
                    </div>
                    <div className="stat-icon blue">📋</div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-info">
                        <h3>Người dùng</h3>
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-change positive">
                            <span>👥</span> Tổng tài khoản
                        </div>
                    </div>
                    <div className="stat-icon purple">👥</div>
                </div>

                <div className="stat-card amber">
                    <div className="stat-info">
                        <h3>Doanh thu</h3>
                        <div className="stat-value" style={{ fontSize: '24px' }}>{formatPrice(stats.revenue)}</div>
                        <div className="stat-change positive">
                            <span>💰</span> Từ đơn hoàn thành
                        </div>
                    </div>
                    <div className="stat-icon amber">💰</div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card rose">
                    <div className="stat-info">
                        <h3>Bài viết</h3>
                        <div className="stat-value">{stats.totalBlogs}</div>
                    </div>
                    <div className="stat-icon rose">📝</div>
                </div>
                <div className="stat-card emerald">
                    <div className="stat-info">
                        <h3>Ưu đãi</h3>
                        <div className="stat-value">{stats.totalPromotions}</div>
                    </div>
                    <div className="stat-icon emerald">🎉</div>
                </div>
            </div>

            {/* Recent Rentals */}
            <div className="table-container" style={{ marginTop: '8px' }}>
                <div className="table-header">
                    <h3 className="table-title">Đơn thuê gần đây</h3>
                </div>
                {recentRentals.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Xe</th>
                                <th>Ngày bắt đầu</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRentals.map((rental: any) => (
                                <tr key={rental.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-sm customer">
                                                {rental.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="user-name">{rental.user?.name || 'N/A'}</div>
                                                <div className="user-email">{rental.user?.email || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                        {rental.motorbike?.name || 'N/A'}
                                    </td>
                                    <td>{new Date(rental.startDate).toLocaleDateString('vi-VN')}</td>
                                    <td className="price">{formatPrice(rental.totalPrice || 0)}</td>
                                    <td>{rentalStatusBadge(rental.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>Chưa có đơn thuê nào</h3>
                        <p>Các đơn thuê xe sẽ xuất hiện ở đây</p>
                    </div>
                )}
            </div>
        </div>
    );
}
