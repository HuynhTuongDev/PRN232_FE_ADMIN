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
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon">GR</div>
                    <h2>GoRide Manager</h2>
                    <p>Đăng nhập vào trang quản trị</p>
                </div>

                {error && (
                    <div className="login-error" id="login-error">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit} id="login-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email</label>
                        <input
                            type="email"
                            id="login-email"
                            className="form-input"
                            placeholder="admin@goride.vn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">Mật khẩu</label>
                        <input
                            type="password"
                            id="login-password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-btn"
                        id="btn-login"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
