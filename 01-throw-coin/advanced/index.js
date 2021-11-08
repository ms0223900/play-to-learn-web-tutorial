const button = document.getElementById('throwCoinBtn');
const coin = document.getElementById('coin');
const throwedResultContent = document.getElementById('throwedResultContent');

const ROTATE_DURATION = 2400; // ms
const TEXT_CONTENT = {
  coinFront: '人頭',
  coinReverse: '錢幣'
};

let throwed = false;


// 產生隨機結果
const throwCoin = () => {
  // 取得正面或反面
  const throwedRes = Math.random();
  // 如果改變數字的話...?
  if(throwedRes < 0.5) {
    return true;
  }
  return false;
}

// 根據結果產生旋轉角度
const makeRotateDeg = (throwedRes) => {
  const rotateAmount = 3 + Math.round((Math.random() * 3));
  const finalDeg = throwedRes ? 0 : 180;
  const deg = (rotateAmount * 360) + finalDeg;
  return deg;
}

// --------------------------------------------------

// 更新畫面
const render = (throwedCoinRes) => {
  const rotateDeg = makeRotateDeg(throwedCoinRes);
  button.setAttribute('disabled', true);
  coin.style.transition = `${ROTATE_DURATION / 1000}s`;
  coin.style.transform = `rotateY(${rotateDeg}deg) scale(1.2)`;

  setTimeout(() => {
    if(throwedCoinRes) {
      throwedResultContent.innerText = TEXT_CONTENT.coinFront;
    } else {
      throwedResultContent.innerText = TEXT_CONTENT.coinReverse;
    }
    resetCoin(rotateDeg);
  }, ROTATE_DURATION);
}

// 錢幣旋轉復原
function resetCoin(rotateDeg = 1080) {
  button.removeAttribute('disabled');
  throwed = false;
  // coin.style.transition = '';
  coin.style.transition = `${0}s`;
  coin.style.transform = `rotateY(${rotateDeg % 360}deg)`;
}

// 清空結果
function clearContent() {
  throwedResultContent.innerText = '';
}

// --------------------------------------------------

// 按鈕註冊"點擊事件，每次點擊都觸發"擲硬幣"
button.addEventListener('click', () => {
  if(!throwed) {
    clearContent();
    const throwedRes = throwCoin();
    throwed = true;
    render(throwedRes);
  }
});