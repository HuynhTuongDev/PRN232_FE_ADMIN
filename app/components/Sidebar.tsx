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
];

export default function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
    const sections = [...new Set(navItems.map(item => item.section))];

    return (
        <aside className="sidebar" id="main-sidebar">
            {/* Logo & Brand */}
            <div className="sidebar-header">
                <div className="sidebar-logo">GR</div>
                <div className="sidebar-brand">
                    <h1>GoRide</h1>
                    <span>Admin Panel</span>
                </div>
            </div>

            {/* Navigation */}
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
                                    <span className="sidebar-link-icon">{item.icon}</span>
                                    <span>{item.label}</span>
                                </a>
                            ))}
                    </React.Fragment>
                ))}
            </nav>

            {/* Footer - Logout */}
            <div className="sidebar-footer">
                <a className="sidebar-link" onClick={onLogout} id="nav-logout" role="button" tabIndex={0}>
                    <span className="sidebar-link-icon">🚪</span>
                    <span>Đăng xuất</span>
                </a>
            </div>
        </aside>
    );
}
