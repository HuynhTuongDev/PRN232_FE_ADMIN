'use client';

import { useState } from 'react';
import { authApi, setTokens, setUser } from '../utils/api';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authApi.login(email, password);

            if (result.success && result.data) {
                const { accessToken, access_token, refreshToken, refresh_token, user } = result.data;
                const at = accessToken || access_token;
                const rt = refreshToken || refresh_token;

                if (at && rt) {
                    setTokens(at, rt);
                }

                if (user) {
                    if (user.role !== 'ADMIN') {
                        setError('Bạn không có quyền truy cập trang quản trị.');
                        setLoading(false);
                        return;
                    }
                    setUser(user);
                }

                onLoginSuccess();
            } else {
                setError(result.message || result.error || 'Đăng nhập thất bại');
            }
        } catch (err: any) {
            setError('Không thể kết nối đến server. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'radial-gradient(circle at top right, #f8fafc, #f1f5f9, #e2e8f0)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 70%)', opacity: 0.08, filter: 'blur(80px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '35%', height: '35%', background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', opacity: 0.05, filter: 'blur(80px)' }}></div>

            <div className="glass-card animate-fade-in" style={{ 
                width: '100%', 
                maxWidth: '420px', 
                padding: '48px 40px', 
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: '24px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)'
            }}>
                <div className="login-logo" style={{ marginBottom: '40px' }}>
                    <div className="login-logo-icon glass-effect" style={{ 
                        width: '64px', 
                        height: '64px', 
                        fontSize: '24px', 
                        fontWeight: 800, 
                        margin: '0 auto 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, #a855f7 100%)',
                        color: '#fff',
                        boxShadow: '0 8px 16px rgba(56, 189, 248, 0.3)'
                    }}>GR</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.5px' }}>GoRide <span style={{ color: 'var(--primary-color)' }}>Manager</span></h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Chào mừng trở lại! Vui lòng đăng nhập.</p>
                </div>

                {error && (
                    <div className="login-error animate-shake" id="login-error" style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span>{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit} id="login-form">
                    <div className="form-group" style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label className="form-label" htmlFor="login-email" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Email quản trị</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </span>
                            <input
                                type="email"
                                id="login-email"
                                className="form-input"
                                placeholder="admin@goride.vn"
                                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', fontSize: '15px', color: 'var(--text-primary)' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px', textAlign: 'left' }}>
                        <label className="form-label" htmlFor="login-password" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Mật khẩu</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </span>
                            <input
                                type="password"
                                id="login-password"
                                className="form-input"
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', fontSize: '15px', color: 'var(--text-primary)' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-btn glass-effect"
                        id="btn-login"
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            padding: '14px', 
                            borderRadius: '14px', 
                            fontSize: '16px', 
                            fontWeight: 600, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px',
                            border: 'none'
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2.5 }}></span>
                                Đang xác thực...
                            </>
                        ) : (
                            <>
                                <span>Đăng nhập ngay</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
