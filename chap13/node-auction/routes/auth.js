const express = require('express');
const passport =require('passport');
const bcrypt = require('bcrypt');

const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

// 회원가입 라우터
router.post('/join', isNotLoggedIn, async(req, res, next) => {
    const {email, nick, password, money } = req.body;
    try {
        const exUser = await User.findOne({where: {email}});  // 기존에 같은 이메일로 가입한 사용자가 있는지 조회
        if(exUser) {  // 있다면 
            return res.redirect('./join?joinError=이미 가입된 이메일입니다.');
        }
        const hash = await bcrypt.hash(password, 12);  // 없다면 hash 메소드를 사용하여 비밀번호를 암호화하고,
        await User.create({  // 사용자 정보 생성
            email,
            nick,
            password: hash,
            money,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

// 로그인 라우터
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {  // 로그인 요청이 들어오면 passport.authenticate('local') 미들웨어가 로그인 전략을 수행
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    }) (req, res, next);
});

// 로그아웃 라우터
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destory();
    res.redirect('/');
});

module.exports = router;
