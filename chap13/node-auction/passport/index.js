const passport = require('passport');

const local = require('./localStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {  // serializeUser는 로그인 시 실행되는 메소드이다. 매개변수로 user(사용자 정보)를 받아서
        done(null, user.id);  // done 함수의 두 번째 인수에 id로 저장
    });

    passport.deserializeUser((id, done) => {  // deserializeUser는 매 요청 시 실행되는 메소드이다. 위의 done 함수의 두 번째 인수가 매개변수가 됨
        User.findOne({where: {id}})  // 위에 저장했던 id를 받아 데이터베이스에서 사용자 정보를 조회
        .then(user => done(null, user))  // 사용자 정보를 가져옴
        .catch(err => done(err));
    });
    local();
};
