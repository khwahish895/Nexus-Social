import { io } from "socket.io-client";

const SOCKET_URL = window.location.origin;
export const socket = io(SOCKET_URL, {
  autoConnect: false
});

export function connectSocket(userId: string) {
  if (!socket.connected) {
    socket.connect();
    socket.emit("join-room", userId);
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
