let io;

class SocketService {
  init(server) {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });

      socket.on('leave_room', (room) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  getIo() {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  }

  emitToRoom(room, event, data) {
    if (io) {
      io.to(room).emit(event, data);
    }
  }

  emitToUser(userId, role, event, data) {
    if (io) {
      io.to(`${role}:${userId}`).emit(event, data);
    }
  }
}

module.exports = new SocketService();
