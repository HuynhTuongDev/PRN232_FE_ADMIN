'use client';

import React from 'react';

interface SidebarProps {
    activePage: string;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', section: 'Tổng quan' },
    { id: 'motorbikes', label: 'Quản lý xe', icon: '🏍️', section: 'Quản lý' },
    { id: 'rentals', label: 'Đơn thuê xe', icon: '📋', section: 'Quản lý' },
    { id: 'users', label: 'Người dùng', icon: '👥', section: 'Quản lý' },
    { id: 'blogs', label: 'Bài viết', icon: '📝', section: 'Nội dung' },
    { id: 'promotions', label: 'Ưu đãi', icon: '🎉', section: 'Nội dung' },
    { id: 'payments', label: 'Thanh toán', icon: '💳', section: 'Quản lý' },
    { id: 'messages', label: 'Tin nhắn', icon: '💬', section: 'Quản lý' },
    { id: 'handover', label: 'Bàn giao xe', icon: '🔑', section: 'Vận hành' },
    { id: 'return-vehicle', label: 'Thu hồi xe', icon: '🏁', section: 'Vận hành' },
];

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
    const sections = [...new Set(navItems.map(item => item.section))];

    return (
        <aside className="sidebar glass-effect" id="main-sidebar" style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRight: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
            <div className="sidebar-header">
                <div className="sidebar-logo" style={{ boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="sidebar-brand">
                    <h1>GoRide</h1>
                    <span style={{ color: 'var(--text-muted)' }}>Admin Premium</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {sections.map(section => (
                    <React.Fragment key={section}>
                        <div className="sidebar-section-title" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>{section}</div>
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
                                    style={{ color: activePage === item.id ? 'var(--primary-600)' : 'var(--text-secondary)' }}
                                >
                                    <span className="sidebar-link-icon">
                                        {item.id === 'dashboard' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>}
                                        {item.id === 'motorbikes' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>}
                                        {item.id === 'rentals' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>}
                                        {item.id === 'users' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                                        {item.id === 'blogs' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                                        {item.id === 'promotions' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H4v4"/><path d="M2 12h20"/><path d="M20 12v8H4v-8"/><path d="m12 8 4-4"/><path d="m12 8-4-4"/></svg>}
                                        { item.id === 'payments' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
                                        { item.id === 'messages' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                                        { item.id === 'verify-users' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                                        { item.id === 'handover' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                                        { item.id === 'return-vehicle' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><rect x="9" y="20" width="6" height="4"/><rect x="5" y="7" width="14" height="13" rx="2"/></svg>}
                                    </span>
                                    <span>{item.label}</span>
                                </a>
                            ))}
                    </React.Fragment>
                ))}
            </nav>

            <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <a className="sidebar-link" onClick={onLogout} id="nav-logout" role="button" tabIndex={0} style={{ color: '#f43f5e' }}>
                    <span className="sidebar-link-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    </span>
                    <span>Đăng xuất</span>
                </a>
            </div>
        </aside>
    );
}
