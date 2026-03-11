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
        </header>
    );
}
