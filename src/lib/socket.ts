import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

export interface SocketEvent {
  event: string;
  handler: (data: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventQueue: Array<{ event: string; data: any }> = [];

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  connect(token?: string, restaurantId?: string): void {
    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket server...');

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers(restaurantId);
  }

  private setupEventHandlers(restaurantId?: string): void {
    if (!this.socket) return;

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;

      // Join restaurant room if authenticated
      if (restaurantId) {
        this.emit('subscribe:restaurant', { restaurantId });
      }

      // Process queued events
      this.processEventQueue();
    });

    // Disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        this.socket?.connect();
      }
    });

    // Connection error
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('💥 Max reconnection attempts reached');
      }
    });

    // Reconnection attempt
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
    });

    // Reconnection successful
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    // Server errors
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Server shutdown notification
    this.socket.on('server:shutdown', (data) => {
      console.warn('⚠️ Server is shutting down:', data.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.eventQueue = [];
      this.reconnectAttempts = 0;
    }
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.socket) {
      console.warn(`⚠️ Cannot subscribe to ${event}: Socket not connected`);
      return;
    }

    this.socket.on(event, handler);
  }

  off(event: string, handler?: (data: any) => void): void {
    if (!this.socket) return;

    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }

  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn(`⚠️ Socket not connected, queueing event: ${event}`);
      this.eventQueue.push({ event, data });
      return;
    }

    this.socket.emit(event, data, (response: any) => {
      if (response?.error) {
        console.error(`❌ Error emitting ${event}:`, response.error);
      }
    });
  }

  private processEventQueue(): void {
    console.log(`📤 Processing ${this.eventQueue.length} queued events`);
    
    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift()!;
      this.emit(event, data);
    }
  }

  // Join a specific table room (for customers)
  joinTable(restaurantId: string, tableNumber: number): void {
    this.emit('join:table', { restaurantId, tableNumber });
  }

  // Subscribe to restaurant updates (for managers)
  subscribeToRestaurant(restaurantId: string): void {
    this.emit('subscribe:restaurant', { restaurantId });
  }

  // Ping to check connection
  ping(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      this.emit('ping', {});
      
      this.socket?.once('pong', () => {
        resolve(Date.now() - startTime);
      });

      // Timeout after 5 seconds
      setTimeout(() => resolve(-1), 5000);
    });
  }
}

// Singleton instance
export const socketService = new SocketService();

export default socketService;
