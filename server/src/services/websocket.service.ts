import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

interface SocketData {
  userId?: string;
  restaurantId?: string;
  role?: string;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedClients: Map<string, Socket> = new Map();

  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.SOCKET_CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();

    console.log('✅ WebSocket service initialized');
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    // Authentication middleware for Socket.io
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          // Allow connection without auth for customer view
          socket.data = {} as SocketData;
          return next();
        }

        // Verify JWT token
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
          id: string;
          role: string;
          restaurantId?: string;
        };

        socket.data = {
          userId: decoded.id,
          role: decoded.role,
          restaurantId: decoded.restaurantId,
        } as SocketData;

        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        // Allow connection anyway (for public customer views)
        socket.data = {} as SocketData;
        next();
      }
    });
  }

  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const socketData = socket.data as SocketData;
      console.log(`🔌 Client connected: ${socket.id} (Role: ${socketData.role || 'guest'})`);

      this.connectedClients.set(socket.id, socket);

      // Join restaurant room if authenticated
      if (socketData.restaurantId) {
        socket.join(`restaurant:${socketData.restaurantId}`);
        console.log(`📍 Joined room: restaurant:${socketData.restaurantId}`);
      }

      // Handle custom events
      this.handleCustomEvents(socket);

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id} (Reason: ${reason})`);
        this.connectedClients.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  private handleCustomEvents(socket: Socket): void {
    const socketData = socket.data as SocketData;

    // Customer joins table room
    socket.on('join:table', (data: { restaurantId: string; tableNumber: number }) => {
      const room = `table:${data.restaurantId}:${data.tableNumber}`;
      socket.join(room);
      console.log(`🪑 Joined table room: ${room}`);
      
      socket.emit('joined:table', {
        success: true,
        room,
      });
    });

    // Manager subscribes to restaurant updates
    socket.on('subscribe:restaurant', (data: { restaurantId: string }) => {
      if (socketData.role === 'manager' || socketData.role === 'admin') {
        const room = `restaurant:${data.restaurantId}`;
        socket.join(room);
        console.log(`🏪 Subscribed to restaurant: ${room}`);
        
        socket.emit('subscribed:restaurant', {
          success: true,
          room,
        });
      } else {
        socket.emit('error', {
          message: 'Unauthorized to subscribe to restaurant updates',
        });
      }
    });

    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  }

  // Emit event to specific restaurant
  emitToRestaurant(restaurantId: string, event: string, data: any): void {
    if (!this.io) return;
    
    const room = `restaurant:${restaurantId}`;
    this.io.to(room).emit(event, data);
    console.log(`📡 Emitted ${event} to ${room}`, data);
  }

  // Emit event to specific table
  emitToTable(restaurantId: string, tableNumber: number, event: string, data: any): void {
    if (!this.io) return;
    
    const room = `table:${restaurantId}:${tableNumber}`;
    this.io.to(room).emit(event, data);
    console.log(`📡 Emitted ${event} to ${room}`, data);
  }

  // Emit event to all connected clients
  emitToAll(event: string, data: any): void {
    if (!this.io) return;
    
    this.io.emit(event, data);
    console.log(`📡 Emitted ${event} to all clients`, data);
  }

  // Get number of connected clients
  getConnectionCount(): number {
    return this.connectedClients.size;
  }

  // Get Socket.IO instance
  getIO(): SocketIOServer | null {
    return this.io;
  }

  // Shutdown gracefully
  async shutdown(): Promise<void> {
    if (!this.io) return;

    console.log('🔌 Closing WebSocket connections...');
    
    // Notify all clients about shutdown
    this.emitToAll('server:shutdown', {
      message: 'Server is shutting down',
      timestamp: Date.now(),
    });

    // Close all connections
    this.io.close();
    this.connectedClients.clear();
    
    console.log('✅ WebSocket service shut down gracefully');
  }
}

// Singleton instance
const socketService = new WebSocketService();

export const getSocketService = (): WebSocketService => {
  return socketService;
};

export default socketService;
