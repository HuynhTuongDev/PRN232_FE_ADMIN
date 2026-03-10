'use client';

import React from 'react';

interface SidebarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>, section: 'Trang chủ' },
    { id: 'motorbikes', label: 'Quản lý xe', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></svg>, section: 'Kinh doanh' },
    { id: 'rentals', label: 'Đơn thuê xe', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, section: 'Kinh doanh' },
    { id: 'users', label: 'Người dùng', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, section: 'Quản trị' },
    { id: 'blogs', label: 'Bài viết', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>, section: 'Nội dung' },
    { id: 'promotions', label: 'Ưu đãi', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>, section: 'Nội dung' },
    { id: 'locations', label: 'Địa điểm', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, section: 'Kinh doanh' },
    { id: 'payments', label: 'Thanh toán', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>, section: 'Kinh doanh' },
    { id: 'messages', label: 'Tin nhắn', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, section: 'Hỗ trợ' },
    { id: 'handover', label: 'Bàn giao xe', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>, section: 'Vận hành' },
    { id: 'return-vehicle', label: 'Thu hồi xe', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" /></svg>, section: 'Vận hành' },
];

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
    const sections = [...new Set(navItems.map(item => item.section))];

    return (
        <aside className="sidebar" id="main-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div className="sidebar-brand">
                    <h1>GoRide</h1>
                    <span>Admin Premium</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {sections.map(section => (
                    <React.Fragment key={section}>
                        <div className="sidebar-section-title">{section}</div>
                        {navItems
                            .filter(item => item.section === section)
                            .map(item => (
                                <a
                                    key={item.id}
                                    id={`nav-${item.id}`}
                                    className={`sidebar-link ${activePage === item.id ? 'active' : ''}`}
                                    onClick={() => onNavigate(item.id)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <span className="sidebar-link-icon">
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </a>
                            ))}
                    </React.Fragment>
                ))}
            </nav>

            <div className="sidebar-footer">
                <a className="sidebar-link" onClick={onLogout} id="nav-logout" role="button" tabIndex={0} style={{ color: 'var(--accent-rose)' }}>
                    <span className="sidebar-link-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </span>
                    <span>Đăng xuất</span>
                </a>
            </div>
        </aside>
    );
}
