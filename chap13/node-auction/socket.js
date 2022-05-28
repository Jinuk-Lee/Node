const socketIO = require('socket.io');

module.exports = (server, app) => {
    const io = socketIO(server, {path: '/socket.io'});
    app.set('io', io);
    io.on('connection', (socket) => {  // 웹 소켓 연결 시
        const req = socket.request;
        const {headers: {referer}} = req;
        const roomId = referer.split('/')[referer.split('/').length - 1];
        socket.join(roomId);  // 클라이언트 연결시 주소로부터 경매방 아이디를 받아와 socket.join으로 해당 방 입장
        socket.on('disconnect', () => {  // 연결이 끊겼다면 
            socket.leave(roomId);  // socket.leave로 해당 방에서 나감
        });
    });
}; 
