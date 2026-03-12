import Pusher from 'pusher-js';

const PUSHER_KEY = 'ab3a2b62b6523f45c70f';
const PUSHER_CLUSTER = 'ap1';

class SocketService {
    private pusher: Pusher | null = null;
    private channel: any = null;

    connect(userId: string) {
        if (this.pusher) return;

        console.log('Admin connecting to Pusher');
        
        this.pusher = new Pusher(PUSHER_KEY, {
            cluster: PUSHER_CLUSTER,
            forceTLS: true
        });

        // Admin usually listens on their userId and admin-room
        const roomToJoin = userId === 'admin-placeholder' ? 'admin-room' : userId;
        this.channel = this.pusher.subscribe(roomToJoin);

        this.pusher.connection.bind('connected', () => {
            console.log('Admin successfully connected to Pusher');
        });

        this.pusher.connection.bind('error', (error: any) => {
            console.warn('Pusher connection error:', error);
        });
    }

    onReceiveMessage(callback: (message: any) => void) {
        if (this.channel) {
            this.channel.bind('receive_message', callback);
        }
    }

    offReceiveMessage() {
        if (this.channel) {
            this.channel.unbind('receive_message');
        }
    }

    sendMessage(payload: { receiverId?: string; content: string; isAI?: boolean }) {
        // Real-time sending should go through API for serverless consistency
        console.warn('sendMessage via Pusher client is not recommended. Use API.');
    }

    disconnect() {
        if (this.pusher) {
            this.pusher.disconnect();
            this.pusher = null;
            this.channel = null;
        }
    }
}

export const socketService = new SocketService();
