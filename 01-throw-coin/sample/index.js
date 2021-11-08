const button = document.getElementById('throwCoinBtn');
const coin = document.getElementById('coin');
const throwedResult = document.getElementById('throwedResult');


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

// --------------------------------------------------

// 更新畫面
const render = (throwedCoinRes) => {
  if(throwedCoinRes) {
    coin.innerText = 'HEAD';
    throwedResult.innerText = '人頭';
  } else {
    coin.innerText = '$10';
    throwedResult.innerText = '錢幣';
  }
}

// --------------------------------------------------

// 按鈕註冊"點擊事件，每次點擊都觸發"擲硬幣"
button.addEventListener('click', () => {
  const throwedRes = throwCoin();
  render(throwedRes);
});