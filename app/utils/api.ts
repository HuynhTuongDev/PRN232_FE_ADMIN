// ============================================
// GoRide Manager - API Service
// ============================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://prn-232-be.vercel.app/api/v1';

// ---- Auth Token Management ----
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('goride_access_token');
}

export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('goride_refresh_token');
}

export function setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('goride_access_token', accessToken);
    localStorage.setItem('goride_refresh_token', refreshToken);
}

export function clearTokens() {
    localStorage.removeItem('goride_access_token');
    localStorage.removeItem('goride_refresh_token');
    localStorage.removeItem('goride_user');
}

export function setUser(user: any) {
    localStorage.setItem('goride_user', JSON.stringify(user));
}

export function getUser(): any {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('goride_user');
    return user ? JSON.parse(user) : null;
}

export function isLoggedIn(): boolean {
    return !!getAccessToken();
}

// ---- API Request Helper ----
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();
    return data;
}

// ============================================
// AUTH API
// ============================================
export const authApi = {
    login: (email: string, password: string) =>
        apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (data: { email: string; password: string; name: string; phone?: string }) =>
        apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getProfile: () => apiRequest('/auth/profile'),

    refreshToken: (refreshToken: string) =>
        apiRequest('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken }),
        }),
};

// ============================================
// USER API
// ============================================
export const userApi = {
    getAll: (page?: number, limit?: number, search?: string) => {
        return apiRequest('/users');
    },

    getById: (id: string) => apiRequest(`/users/${id}`),

    update: (id: string, data: any) =>
        apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

// ============================================
// MOTORBIKE API
// ============================================
export const motorbikeApi = {
    getAll: (params?: { page?: number; limit?: number; type?: string; status?: string; search?: string }) => {
        return apiRequest('/motorbikes');
    },

    getById: (id: string) => apiRequest(`/motorbikes/${id}`),

    create: (data: any) =>
        apiRequest('/motorbikes', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        apiRequest(`/motorbikes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiRequest(`/motorbikes/${id}`, { method: 'DELETE' }),
};

// ============================================
// RENTAL API
// ============================================
export const rentalApi = {
    getAll: (page?: number, limit?: number, status?: string) => {
        return apiRequest('/rentals/all');
    },

    getById: (id: string) => apiRequest(`/rentals/${id}`),

    updateStatus: (id: string, status: string) =>
        apiRequest(`/rentals/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
};

// ============================================
// BLOG API
// ============================================
export const blogApi = {
    getAll: () => apiRequest('/blogs'),

    getById: (id: string) => apiRequest(`/blogs/${id}`),

    create: (data: any) =>
        apiRequest('/blogs', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        apiRequest(`/blogs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiRequest(`/blogs/${id}`, { method: 'DELETE' }),
};

// ============================================
// PROMOTION API
// ============================================
export const promotionApi = {
    getAll: () => apiRequest('/promotions'),

    getById: (id: string) => apiRequest(`/promotions/${id}`),

    create: (data: any) =>
        apiRequest('/promotions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        apiRequest(`/promotions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiRequest(`/promotions/${id}`, { method: 'DELETE' }),
};

// ============================================
// HELPER: Format Price VND
// ============================================
export function formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num.toLocaleString('vi-VN') + 'đ';
}

// ============================================
// HELPER: Format Date
// ============================================
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ============================================
// HELPER: Status Mappings
// ============================================
export const motorbikeStatusMap: Record<string, { label: string; badge: string }> = {
    AVAILABLE: { label: 'Có sẵn', badge: 'success' },
    RENTED: { label: 'Đang thuê', badge: 'info' },
    MAINTENANCE: { label: 'Bảo trì', badge: 'warning' },
    UNAVAILABLE: { label: 'Không khả dụng', badge: 'error' },
};

export const motorbikeTypeMap: Record<string, string> = {
    MANUAL: 'Xe số',
    SCOOTER: 'Xe ga',
    SEMI_AUTO: 'Xe côn',
};

export const rentalStatusMap: Record<string, { label: string; badge: string }> = {
    PENDING: { label: 'Chờ xác nhận', badge: 'warning' },
    CONFIRMED: { label: 'Đã xác nhận', badge: 'info' },
    ONGOING: { label: 'Đang thuê', badge: 'purple' },
    COMPLETED: { label: 'Hoàn thành', badge: 'success' },
    CANCELLED: { label: 'Đã hủy', badge: 'error' },
};

export const userRoleMap: Record<string, { label: string; badge: string }> = {
    ADMIN: { label: 'Admin', badge: 'purple' },
    CUSTOMER: { label: 'Khách hàng', badge: 'info' },
};
