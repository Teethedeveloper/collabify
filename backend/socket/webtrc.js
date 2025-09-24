// socket/webrtc.js
export const webrtcHandlers = (io, socket) => {
  console.log("⚡ WebRTC socket connected:", socket.id);

  // User joins a room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", userId);
  });

  // Handle WebRTC offer
  socket.on("offer", ({ roomId, offer, sender }) => {
    socket.to(roomId).emit("offer", { offer, sender });
  });

  // Handle WebRTC answer
  socket.on("answer", ({ roomId, answer, sender }) => {
    socket.to(roomId).emit("answer", { answer, sender });
  });

  // Handle ICE candidates
  socket.on("ice-candidate", ({ roomId, candidate, sender }) => {
    socket.to(roomId).emit("ice-candidate", { candidate, sender });
  });

  // Screen share
  socket.on("screen-share-start", ({ roomId, userId }) => {
    socket.to(roomId).emit("screen-share-start", { userId });
  });

  socket.on("screen-share-stop", ({ roomId, userId }) => {
    socket.to(roomId).emit("screen-share-stop", { userId });
  });

  // User leaves
  socket.on("leave-room", (roomId, userId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", userId);
  });

  socket.on("disconnect", () => {
    console.log("❌ WebRTC socket disconnected:", socket.id);
  });
};
npmru