import { useEffect, useRef, useCallback } from 'react';
import { socketService, SocketEvent } from '@/lib/socket';

interface UseSocketOptions {
  events?: SocketEvent[];
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { events = [], onConnect, onDisconnect } = options;
  const handlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    // Setup connection event handlers
    const connectHandler = () => {
      console.log('🔌 Socket connected in hook');
      onConnect?.();
    };

    const disconnectHandler = () => {
      console.log('🔌 Socket disconnected in hook');
      onDisconnect?.();
    };

    socketService.on('connect', connectHandler);
    socketService.on('disconnect', disconnectHandler);

    // Subscribe to provided events
    events.forEach(({ event, handler }) => {
      socketService.on(event, handler);
      handlersRef.current.set(event, handler);
    });

    // Cleanup on unmount
    return () => {
      socketService.off('connect', connectHandler);
      socketService.off('disconnect', disconnectHandler);

      // Unsubscribe from all events
      handlersRef.current.forEach((handler, event) => {
        socketService.off(event, handler);
      });
      handlersRef.current.clear();
    };
  }, [events, onConnect, onDisconnect]);

  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    socketService.on(event, handler);
    handlersRef.current.set(event, handler);
  }, []);

  const unsubscribe = useCallback((event: string) => {
    const handler = handlersRef.current.get(event);
    if (handler) {
      socketService.off(event, handler);
      handlersRef.current.delete(event);
    }
  }, []);

  return {
    emit,
    subscribe,
    unsubscribe,
    isConnected: socketService.isConnected,
    joinTable: socketService.joinTable.bind(socketService),
    subscribeToRestaurant: socketService.subscribeToRestaurant.bind(socketService),
    ping: socketService.ping.bind(socketService),
  };
};

// Specialized hooks for common use cases

export const useOrderUpdates = (onOrderUpdate: (order: any) => void) => {
  return useSocket({
    events: [
      { event: 'order:created', handler: onOrderUpdate },
      { event: 'order:updated', handler: onOrderUpdate },
      { event: 'order:cancelled', handler: onOrderUpdate },
    ],
  });
};

export const useTableUpdates = (onTableUpdate: (table: any) => void) => {
  return useSocket({
    events: [
      { event: 'table:updated', handler: onTableUpdate },
      { event: 'table:alert', handler: onTableUpdate },
    ],
  });
};

export const useMenuUpdates = (onMenuUpdate: (item: any) => void) => {
  return useSocket({
    events: [
      { event: 'menu:updated', handler: onMenuUpdate },
      { event: 'menu:availability', handler: onMenuUpdate },
    ],
  });
};
