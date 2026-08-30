import { Server, Socket } from 'socket.io';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room (e.g. 'kitchen', 'cashier', 'whatsapp')
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`[Socket.io] Client ${socket.id} joined room: ${room}`);
    });

    // POS Cashier broadcasts new order to Kitchen Display
    socket.on('new_order', (orderData: any) => {
      console.log('[Socket.io] New Order received, broadcasting to kitchen:', orderData.invoiceNumber);
      io.to('kitchen').emit('kitchen_order_received', orderData);
    });

    // Kitchen marks item / order as ready
    socket.on('order_status_updated', (updateData: any) => {
      console.log('[Socket.io] Order status updated:', updateData);
      io.emit('order_status_changed', updateData);
    });

    // WhatsApp Live Sync between agents
    socket.on('whatsapp_message_sent', (msgData: any) => {
      socket.broadcast.to('whatsapp').emit('whatsapp_message_received', msgData);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}
