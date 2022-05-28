// 로그인 전략을 구현하는 파일입니다.
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({  // 전략을 설정하는 곳이다.
        usernameField: 'email',  // 
        passwordField: 'password',
    }, async (email, password, done) => {  //  async 함수는 실제 전략을 수행하는 곳이다.
        try {
            const exUser = await User.findOne({where: {email}});  // 1. 사용자 데이터베이스에서 일치하는 이메일이 있는지 찾음
            if (exUser) {  // 1-1. 있다면 compare 함수로 비밀번호를 비교 
                const result = await bcrypt.compare(password, exUser.password);
                if(result) {  // 2-1. 비밀번호까지 일치한다면 done 함수의 두 번째 인수로 사용자 정보를 넣어 보냄
                    done(null, exUser);
                } else {  // 2-2. 비밀번호가 일치하지 않다면 메시지 출력
                    done(null, false, {message: '비밀번호가 일치하지 않습니다.'});
                }
            } else {  // 1-2. 없다면 메시지 출력
                done(null, false, {message: '가입되지 않은 회원입니다.'});
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};
