let timer;
const
    timeLeft = document.querySelector(".display__time-left"),
    endTime = document.querySelector(".display__end-time"),
    btns = document.querySelectorAll("button");

//取得時間並傳給timeCount換算
function setTime() {
    sec = parseInt(this.dataset.time) //此為字串須轉為數字
    timeCount(sec);
}
//換算時間回傳倒數
function timeCount(sec) {
    const
        now = new Date().getTime(),//取得現在的時間戳記
        end = now + sec * 1000, //現在的時間加上設定的時間=將要完成的時間，乘上1000是因為要轉為毫秒
        endDate = new Date(end);//再把時間戳記轉為正常的時間
    //將數據傳給countDown
    countDown(end);
    //將數據傳給end-time
    endTimeDisplay(endDate);
}
//計時器倒數
function countDown(end) {
    clearInterval(timer);
    timer = setInterval(function () {
        const leftSec = (end - new Date().getTime()) / 1000;//總秒數=最終時間減現在時間，因為是毫秒所以要除1000
        if (leftSec >= 0) {
            const Leftmin = Math.floor(leftSec / 60); //計算分
            let Leftsec = Math.floor(leftSec % 60); //計算秒
            Leftsec = Leftsec < 10 ? "0" + Leftsec : Leftsec;//將不足兩位數的數字補足
            //讓時間顯示
            timeLeft.innerHTML = `      
        <h1 class="display__time-left">${Leftmin}:${Leftsec}</h1>`;
        } else {
            clearInterval(timer);
            timeLeft.innerHTML = `<img src="timer.jpg">`;
        }
    }, 16);//設16是要刷新快一點顯示更流暢
}
//end-time的時間顯示
function endTimeDisplay(endDate) {
    let
        endmin = endDate.getHours(),
        endsec = endDate.getMinutes();
    endsec = endsec < 10 ? "0" + endsec : endsec;//將不足兩位數的數字補足
    //讓時間顯示
    endTime.innerHTML = `      
    <p class="display__end-time">Be Back At ${endmin}:${endsec}</p>`;
}
btns.forEach((btn) => {
    btn.addEventListener("click", setTime);
});
//對input輸入的值做判斷並*60轉為秒回傳+重設表單
document.querySelector("#custom").addEventListener("submit", function (e) {
    e.preventDefault();//取消預設行為不要讓form轉址
    const value = parseInt(this.minutes.value);
    if (value) {
        timeCount(value * 60);
        this.reset();
    }
});