'use client';

interface HeaderProps {
    title: string;
    subtitle?: string;
    userName?: string;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Tổng quan', subtitle: 'Theo dõi hoạt động kinh doanh hôm nay' },
    motorbikes: { title: 'Quản lý xe máy', subtitle: 'Thông tin các phương tiện đang hoạt động' },
    rentals: { title: 'Đơn thuê xe', subtitle: 'Quản lý lịch trình và đơn đặt xe' },
    users: { title: 'Người dùng', subtitle: 'Khách hàng và phân quyền hệ thống' },
    blogs: { title: 'Bài viết', subtitle: 'Cập nhật tin tức và hướng dẫn' },
    promotions: { title: 'Chương trình Ưu đãi', subtitle: 'Thu hút khách hàng với mã giảm giá' },
    payments: { title: 'Giao dịch Thanh toán', subtitle: 'Kiểm soát dòng tiền và trạng thái thanh toán' },
    messages: { title: 'Hỗ trợ khách hàng', subtitle: 'Phản hồi tin nhắn và khiếu nại' },
    handover: { title: 'Bàn giao xe', subtitle: 'Xác nhận giao xe cho khách hàng' },
    'return-vehicle': { title: 'Thu hồi xe', subtitle: 'Kiểm tra và nhận lại xe từ khách' },
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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
