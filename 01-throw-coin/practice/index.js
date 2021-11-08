const button = document.getElementById('throwCoinBtn');
const coin = document.getElementById('coin');
const throwedResult = document.getElementById('throwedResult');


// 產生隨機結果
const throwCoin = () => {
  // 取得正面或反面
  const throwedRes = Math.random();
  // 取得隨機的正或反，可以用true false或是0, 1都可以
}

// --------------------------------------------------

// 更新畫面
// 將隨機擲硬幣的結果"傳進來"，給網頁上的元素(按鈕、文字等等)做更新
const render = (throwedCoinRes) => {
  // 判斷結果條件，更新畫面
}

// --------------------------------------------------

// 按鈕註冊"點擊事件，每次點擊都觸發"擲硬幣"
button.addEventListener('click', () => {
  // 先產生隨機結果

  // 接著更新畫面
});