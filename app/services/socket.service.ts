import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://prn-232-be.vercel.app/api/v1';

class SocketService {
    private socket: Socket | null = null;
    private connecting = false;

    connect(userId: string) {
        if (this.socket?.connected || this.connecting) return;
        this.connecting = true;

        this.socket = io(SOCKET_URL, {
            transports: ['polling', 'websocket'], // Ưu tiên polling trước, websocket sau để phù hợp hơn với Serverless
            reconnection: true,
            reconnectionAttempts: 3, // Giới hạn số lần thử lại để tránh console lỗi liên tục
            reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => {
            this.connecting = false;
            console.log('Admin connected to socket server');
            this.socket?.emit('join_room', userId);
        });

        this.socket.on('connect_error', (error) => {
            this.connecting = false;
            console.warn('Socket connection error (Vercel does not support native WebSockets):', error.message);
            // Ngắt kết nối luôn để tránh spam console
            if (this.socket) {
                this.socket.disconnect();
            }
        });

        this.socket.on('disconnect', () => {
            this.connecting = false;
            console.log('Admin disconnected from socket server');
        });
    }

    onReceiveMessage(callback: (message: any) => void) {
        this.socket?.on('receive_message', callback);
    }

    offReceiveMessage() {
        this.socket?.off('receive_message');
    }

    sendMessage(payload: { receiverId?: string; content: string; isAI?: boolean }) {
        this.socket?.emit('send_message', payload);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
