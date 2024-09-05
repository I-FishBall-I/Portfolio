(function () {
  const scoreBoard = document.querySelector('.score');
  const moles = [...document.querySelectorAll('.mole')];
  const btn = document.querySelector('button');
  let score = 0;
  let timeUp = true;
  // moles = [div.mole, div.mole, div.mole，希望將其轉成物件 { 0: false, 1: false, 2: false }。
  // 第一步：prev 是 {}，index 是 0，變成 { 0: false }。
  // 第二步：prev 是 { 0: false }，index 是 1，變成 { 0: false, 1: false }
  const status = moles.reduce((prev, current, index) => {
    prev[index] = false;
    return prev;
  }, {});
  //使用代理的方式以資料帶動畫面的方式來運作
  const molesProxy = new Proxy(status, {
    get(target, key) {
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      moles[key].removeEventListener('click', clickHandler);
      if (value) {
        moles[key].addEventListener('click', clickHandler);
        moles[key].classList.add('up');
      } else {
        moles[key].classList.remove('up');
      }
    },
  });
  //點擊=>先確認是不是我Proxy裡面的資料如果是分數加1並將true=>false，以防透過修改stylex來作弊
  function clickHandler() {
    // this=>老鼠起來的div
    if (molesProxy[moles.indexOf(this)]) {
      setScore(score + 1);
      molesProxy[moles.indexOf(this)] = false;
    }
  }
  //分數計算並顯示
  function setScore(s) {
    score = s;
    scoreBoard.textContent = score;
  }
  //讓老鼠顯示
  function setMole(mole, time) {
    //如果遇到正顯示的地鼠就return重新排隊=>如果不是就顯示=>設定計時器如果時間還沒到就一直出老鼠否則就關掉
    if (molesProxy[mole]) return RandomMole();
    molesProxy[mole] = true;
    setTimeout(() => {
      if (!timeUp) RandomMole();
      molesProxy[mole] = false;
    }, time);
  }
  //隨機老鼠的位置、時間
  function RandomMole() {
    //隨機地鼠
    const mole = Math.floor(Math.random() * moles.length);
    //隨機顯示時間
    const time = Math.floor(Math.random() * 500 + 500);
    setMole(mole, time);
  }
  // 點擊開始先確認是否開始了=>還沒開始，分數=0、timeUp關閉、啟動RandomMole()並開始倒數=>時間到timeUp起動
  function startGame() {
    if (!timeUp) return;
    setScore(0);
    timeUp = false;
    RandomMole();
    setTimeout(() => {
      (timeUp = true), alert('time up');
    }, 10000);
  }
  btn.addEventListener('click', startGame);
})();
