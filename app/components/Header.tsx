'use client';

interface HeaderProps {
    title: string;
    subtitle?: string;
    userName?: string;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Tổng quan hoạt động kinh doanh' },
    motorbikes: { title: 'Quản lý xe máy', subtitle: 'Thêm, sửa, xóa thông tin xe' },
    rentals: { title: 'Đơn thuê xe', subtitle: 'Quản lý các đơn thuê xe' },
    users: { title: 'Người dùng', subtitle: 'Quản lý tài khoản người dùng' },
    blogs: { title: 'Bài viết', subtitle: 'Quản lý blog và tin tức' },
    promotions: { title: 'Ưu đãi', subtitle: 'Quản lý chương trình khuyến mãi' },
};

export default function Header({ title, subtitle, userName }: HeaderProps) {
    const pageInfo = pageTitles[title] || { title, subtitle: subtitle || '' };

    return (
        <header className="header" id="main-header">
            <div className="header-left">
                <div>
                    <div className="header-title">{pageInfo.title}</div>
                    <div className="header-subtitle">{pageInfo.subtitle}</div>
                </div>
            </div>
            <div className="header-right">
                <button className="header-btn" id="btn-notifications" aria-label="Thông báo">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="notification-dot"></span>
                </button>
                <div className="header-avatar" id="header-user-avatar" title={userName || 'Admin'}>
                    {userName ? userName.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>
        </header>
    );
}
