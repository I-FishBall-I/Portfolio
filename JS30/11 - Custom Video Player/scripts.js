const
    video = document.querySelector('video'),
    play = document.querySelector('.toggle'),
    volum = document.querySelector('input[name="volume"]'),
    speed = document.querySelector('input[name="playbackRate"]'),
    playSkip = document.querySelectorAll('button'),
    progress = document.querySelector('.progress'),//使用者拖移的
    progressBar = document.querySelector('.progress__filled');//調整整個寬度的

video.addEventListener('click', playToogle);
play.addEventListener('click', playToogle);
volum.addEventListener('input', volChg);
speed.addEventListener('input', speedChg);
playSkip.forEach(item => item.addEventListener('click', playSkipChg));
video.addEventListener('timeupdate', timeUpdate);

progress.addEventListener('mousedown', addPosition);
progress.addEventListener('mouseup', removePosition);


//控制播放
function playToogle() {
    if (video.paused) {
        video.play();
        play.innerHTML = `| |`;
    } else {
        video.pause();
        play.innerHTML = `►`;
    }
};
//控制音量
function volChg() {
    video.volume = volum.value;
    // console.log(video.volume);
};
//播放速度
function speedChg() {
    video.playbackRate = speed.value;
    // console.log(video.playbackRate);
};
//倒退快進
function playSkipChg() {
    // console.log(this);
    this.dataset.skip == -10 ? video.currentTime -= 10 : video.currentTime += 25;
};
//進度條更新
function timeUpdate() {
    const percent = video.currentTime / video.duration * 100;
    progressBar.style.flexBasis = `${percent}%`;
};
//拖移進度條
function addPosition(e) {
    progress.addEventListener('mousedown', move);
    progress.addEventListener('mousemove', move);
};
function removePosition() {
    progress.removeEventListener('mousemove', move);
};
//移動進度條
function move(e) {
    const percent = e.offsetX / video.duration;
    newPosition = percent * video.duration;
    video.currentTime = newPosition;

};