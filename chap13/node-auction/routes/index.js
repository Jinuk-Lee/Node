const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');

const { Good, Auction, User } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const goods = await Good.findAll({ where: { SoldId: null } });
    res.render('main', {
      title: 'NodeAuction',
      goods,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', {
    title: '회원가입 - NodeAuction',
  });
});

router.get('/good', isLoggedIn, (req, res) => {
  res.render('good', { title: '상품 등록 - NodeAuction' });
});

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/good', isLoggedIn, upload.single('img'), async (req, res, next) => {
  try {
    const { name, price } = req.body;
    const good = await Good.create({
      OwnerId: req.user.id,
      name,
      img: req.file.filename,
      price,
    });
    const end = new Date();
    end.setDate(end.getDate()+1);
    schedule.scheduleJob(end, async () => {  // scheduleJob 메소드로 일정을 예약함. 첫 번째 인수로 실행될 시각, 두 번째 인수로 해당 시각이 실행되었을 때 수행할 콜백함수 넣음
      const success = await Auction.findOne({
        where: { GoodId: good.id},
        order: [['bid', 'DESC']],
      });
      await Good.update({SoldId: success.UserId}, {where: {id: good.id}});
      await User.update({
        money: sequelize.literal(`money - ${success.bid}`),  // 낙찰자의 보유 자금에서 낙찰 금액만큼 뺌
      }, {
        where: {id: success.UserId},
      });
    });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 해당 상품과 기존 입찰 정보들을 불러온 뒤 렌더링하는 라우터
router.get('/good/:id', isLoggedIn, async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        include: {
          model: User,
          as: 'Owner',  // 상품 모델과 사용자 모델은 일대다 관계가 두 번 연결(Owner, Sold)되어 있으므로 어떤 관계를 include할지 as 속성으로 밝혀야 함
        },
      }),
      Auction.findAll({
        where: { GoodId: req.params.id },
        include: { model: User },
        order: [['bid', 'ASC']],
      }),
    ]);
    res.render('auction', {
      title: `${good.name} - NodeAuction`,
      good,
      auction,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 클라이언트로부터 받은 입찰 정보를 저장하는 라우터
router.post('/good/:id/bid', isLoggedIn, async (req, res, next) => {
  try {
    const { bid, msg } = req.body;
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: { model: Auction },
      order: [[{ model: Auction }, 'bid', 'DESC']],  // Good.findOne 메소드의 order 속성
    });
    if (good.price >= bid) {  // 시작 가격보다 낮게 입찰했거나
      return res.status(403).send('시작 가격보다 높게 입찰해야 합니다.');
    }
    if (new Date(good.createdAt).valueOf() + (24 * 60 * 60 * 1000) < new Date()) {  // 경매 종료 시간이 지났거나
      return res.status(403).send('경매가 이미 종료되었습니다');
    }
    if (good.Auctions[0] && good.Auctions[0].bid >= bid) {  // 이전 입찰가보다 낮은 입찰가가 들어왔다면
      return res.status(403).send('이전 입찰가보다 높아야 합니다');  // 돌려보냄
    }
    const result = await Auction.create({
      bid,
      msg,
      UserId: req.user.id,
      GoodId: req.params.id,
    });
    // 실시간으로 입찰 내역 전송
    req.app.get('io').to(req.params.id).emit('bid', {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });
    return res.send('ok');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// 낙찰자가 낙찰 내역을 볼 수 있도록 라우터 추가
router.get('/list', isLoggedIn, async(req, res, next) => {
  try {
    const goods = await Good.findAll({
      where: {SoldId: req.user.id},
      include: {model: Auction},
      order: [[{model: Auction}, 'bid', 'DESC']],
    });
    res.render('list', {title: '낙찰 목록 - NodeAuction', goods});
  } catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
