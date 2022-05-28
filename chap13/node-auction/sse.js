const SSE = require('sse');

module.exports = (server) => {
    const sse = new SSE(server);  // sse 모듈을 불러와 new SSE로 서버 객체를 생성함

    // 생성한 객체에 connection 이벤트 리스너를 연결하여 클라이언트와 연결할 때 어떤 동작을 할지 정의함, 클라이언트에 메시지를 보낼 때 이 객체를 사용
    sse.on('connection', (client) => { 
        setInterval(() => {
            client.send(Date.now().toString());  // 숫자인 타임스탬프를 문자열로 변경   
        }, 1000);  // 1초마다 접속한 클라이언트에 서버 시간 타임스탬프를 보내도록 함
    });
};
