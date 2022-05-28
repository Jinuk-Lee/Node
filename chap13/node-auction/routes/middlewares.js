exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {  // 로그인 중이면 req.isAuthenticated() 메소드가 true, 아니면 false 
      next();
  } else {
      res.redirect('/?loginError=로그인이 필요합니다.');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
      next();
  } else {
      res.redirect('/');
  }
};
