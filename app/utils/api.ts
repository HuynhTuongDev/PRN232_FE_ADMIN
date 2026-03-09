// ============================================
// GoRide Manager - API Service
// ============================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

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
        ...((options.headers as Record<string, string>) || {}),
    };

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

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
    getAll: (page?: number, search?: string) => {
        const query = new URLSearchParams();
        if (page) query.append('page', String(page));
        if (search) query.append('search', search);
        const qStr = query.toString();
        return apiRequest(`/users${qStr ? '?' + qStr : ''}`);
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
        const filteredParams = params ? Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'limit')) : undefined;
        const query = filteredParams ? '?' + new URLSearchParams(Object.entries(filteredParams).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';
        return apiRequest(`/motorbikes${query}`);
    },

    getById: (id: string) => apiRequest(`/motorbikes/${id}`),

    create: (data: any) =>
        apiRequest('/motorbikes', {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        apiRequest(`/motorbikes/${id}`, {
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiRequest(`/motorbikes/${id}`, { method: 'DELETE' }),
};

// ============================================
// RENTAL API
// ============================================
export const rentalApi = {
    getAll: (page?: number, status?: string) => {
        const query = new URLSearchParams();
        if (page) query.append('page', String(page));
        if (status) query.append('status', status);
        const qStr = query.toString();
        return apiRequest(`/rentals/all${qStr ? '?' + qStr : ''}`);
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
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        apiRequest(`/blogs/${id}`, {
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
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
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        apiRequest(`/promotions/${id}`, {
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiRequest(`/promotions/${id}`, { method: 'DELETE' }),
};

// ============================================
// PAYMENT API (MOCK)
// ============================================
const MOCK_PAYMENTS = [
    { id: 'PAY-001', rentalId: 'REN-101', customerName: 'Nguyễn Văn A', amount: 500000, method: 'BANK_TRANSFER', status: 'SUCCESS', date: '2024-03-01T10:00:00Z', transactionId: 'TXN123456789' },
    { id: 'PAY-002', rentalId: 'REN-102', customerName: 'Trần Thị B', amount: 1200000, method: 'MOMO', status: 'PENDING', date: '2024-03-05T14:30:00Z', transactionId: 'MOMO987654321' },
    { id: 'PAY-003', rentalId: 'REN-103', customerName: 'Lê Văn C', amount: 350000, method: 'CASH', status: 'SUCCESS', date: '2024-03-04T09:15:00Z', transactionId: 'CASH-REF-001' },
    { id: 'PAY-004', rentalId: 'REN-104', customerName: 'Phạm Minh D', amount: 800000, method: 'BANK_TRANSFER', status: 'FAILED', date: '2024-03-06T11:20:00Z', transactionId: 'TXN999888777' },
    { id: 'PAY-005', rentalId: 'REN-105', customerName: 'Hoàng Anh E', amount: 2100000, method: 'MOMO', status: 'SUCCESS', date: '2024-03-02T16:45:00Z', transactionId: 'MOMO112233445' },
];

export const paymentApi = {
    getAll: () => apiRequest('/payment/all'),
    updateStatus: (id: string, status: string) =>
        apiRequest(`/payment/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
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

export const paymentStatusMap: Record<string, { label: string; badge: string }> = {
    PENDING: { label: 'Chờ xử lý', badge: 'warning' },
    SUCCESS: { label: 'Thành công', badge: 'success' },
    FAILED: { label: 'Thất bại', badge: 'error' },
};

export const paymentMethodMap: Record<string, string> = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản',
    MOMO: 'Ví MoMo',
};

// ============================================
// CHAT API (MOCK)
// ============================================
const MOCK_CONTACTS = [
    { id: 'usr-1', name: 'Nguyễn Văn A', avatar: '', lastMessage: 'Tôi muốn hỏi về con Exciter 150', time: '10:30', unread: 2, online: true },
    { id: 'usr-2', name: 'Trần Thị B', avatar: '', lastMessage: 'Cảm ơn shop nhiều nhé!', time: 'Hôm qua', unread: 0, online: false },
    { id: 'usr-3', name: 'Lê Văn C', avatar: '', lastMessage: 'Xe này còn không ạ?', time: '2 ngày trước', unread: 0, online: true },
    { id: 'usr-4', name: 'Phạm Minh D', avatar: '', lastMessage: 'Gửi cho mình xem thêm ảnh nhé', time: '1 tuần trước', unread: 0, online: false },
];

const MOCK_MESSAGES: Record<string, any[]> = {
    'usr-1': [
        { id: 1, sender: 'customer', text: 'Chào shop, mình đang quan tâm đến xe Exciter 150', time: '10:25' },
        { id: 2, sender: 'admin', text: 'Chào bạn, hiện shop đang còn 3 chiếc Exciter 150 nhé. Bạn muốn xem đời năm bao nhiêu?', time: '10:26' },
        { id: 3, sender: 'customer', text: 'Mình muốn xem đời 2022 màu xanh GP', time: '10:28' },
        { id: 4, sender: 'customer', text: 'Tôi muốn hỏi về con Exciter 150', time: '10:30' },
    ],
    'usr-2': [
        { id: 1, sender: 'customer', text: 'Xe đi rất tốt ạ. Lần sau mình sẽ ủng hộ tiếp', time: '09:00' },
        { id: 2, sender: 'admin', text: 'Cảm ơn bạn đã tin tưởng GoRide nhé! Chúc bạn vạn dặm bình an.', time: '09:05' },
        { id: 3, sender: 'customer', text: 'Cảm ơn shop nhiều nhé!', time: '09:10' },
    ]
};

export const chatApi = {
    getContacts: () => apiRequest('/chat/contacts'),
    getMessages: (userId: string) => apiRequest(`/chat/messages/${userId}`),
    sendMessage: (receiverId: string, content: string) =>
        apiRequest('/chat/send', {
            method: 'POST',
            body: JSON.stringify({ receiverId, content }),
        }),
};

// ============================================
// OPERATIONAL API (MOCK)
// ============================================
const MOCK_VERIFICATIONS = [
    { id: 'v-1', userId: 'usr-1', name: 'Nguyễn Văn A', email: 'vana@gmail.com', documents: { idFront: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=500', idBack: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500', license: 'https://images.unsplash.com/photo-1559030623-0226b1241edd?w=500' }, status: 'PENDING', date: '2024-03-06' },
    { id: 'v-2', userId: 'usr-4', name: 'Phạm Minh D', email: 'dpham@gmail.com', documents: { idFront: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=500', idBack: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500', license: 'https://images.unsplash.com/photo-1559030623-0226b1241edd?w=500' }, status: 'PENDING', date: '2024-03-05' },
];

export const operationalApi = {
    // User Verification
    getPendingVerifications: async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return { data: MOCK_VERIFICATIONS.filter(v => v.status === 'PENDING'), success: true };
    },
    updateVerification: async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const v = MOCK_VERIFICATIONS.find(item => item.id === id);
        if (v) v.status = status;
        return { success: true };
    },

    // Handover & Return are built on top of rentalApi but filtered
    getHandoverList: async () => {
        const res = await rentalApi.getAll();
        const rentals = res.data.rentals || res.data || [];
        return { data: rentals.filter((r: any) => r.status === 'CONFIRMED'), success: true };
    },
    getReturnList: async () => {
        const res = await rentalApi.getAll();
        const rentals = res.data.rentals || res.data || [];
        return { data: rentals.filter((r: any) => r.status === 'ONGOING'), success: true };
    }
};
