import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class SocketService {
    private socket: Socket | null = null;
    private connecting = false;

    connect(userId: string) {
        if (this.socket?.connected || this.connecting) return;
        this.connecting = true;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
        });

        this.socket.on('connect', () => {
            this.connecting = false;
            console.log('Admin connected to socket server');
            this.socket?.emit('join_room', userId);
        });

        this.socket.on('connect_error', () => {
            this.connecting = false;
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
