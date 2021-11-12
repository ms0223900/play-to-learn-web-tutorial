

(() => {
  // 先抓取網頁上的元件
  const resultEl = document.getElementById('result');
  const currentPlayerEl = document.getElementById('currentPlayer');
  const gridList = document.getElementsByClassName('grid');
  const startButton = document.getElementById('start');
  const resetButton = document.getElementById('reset');

  // 設定好數值
  
  const AMOUNT_FOR_WINNING = 3;
  const CIRCLE = 'CIRCLE';
  const CROSS = 'CROSS';
  
  const player1 = CIRCLE;
  const player2 = CROSS;
  const initPlayer = player1;
  
  let gameResult = undefined;
  let currentPlayer = undefined;
  let realPlayerSelected = player1; // 預設玩家都是player1
  let gridState = [];
  let player1GridState = [];
  let player2GridState = [];
  let placedGridAmount = 0;

  // --------------------------------------------------
  // 遊戲邏輯

  
  // 新增隨機"誰先下"
  function getRandomPlayer() {
    if(Math.random() < 0.5) {
      currentPlayer = player1;
    } else {
      currentPlayer = player2;
    }
  }

  // 交換玩家
  function changePlayer() {
    if(currentPlayer === player1) {
      currentPlayer = player2;
    } else {
      currentPlayer = player1;
    }
    updateCurrentPlayerText();
  }

  // 在格子上"下棋"，決定這輪是圈圈 還是 叉叉
  function playTikTacToe(gridIndex) {
    // 將這一輪的玩家"存起來"
    const player = currentPlayer;

    // 確認該格"是否已經有OO or XX了
    if(gridState[gridIndex]) return undefined;
    gridState[gridIndex] = player;
    if(player === player1) {
      player1GridState.push(gridIndex);
    } else {
      player2GridState.push(gridIndex);
    }
    placedGridAmount += 1;
    
    // 把這一輪的結果"輸出"，留待畫面更新
    return player;
  }


  // 最重要的邏輯
  // 確認"哪個玩家"贏了

  // 將"符合數量的狀況"抽象化"，之後可以將其用於5子棋等遊戲
  function checkSingleMatchSituation(amountForMatching = AMOUNT_FOR_WINNING, amountForChecking = 3, ) {
    return function(initGridIdx, player, getNextGridFn = (initIdx, i) => initIdx) {
      let sameRowMatched = 0;
      let matchedIdxList = [];
      let notMatchedAndEmptyIdxList = [];

      for (let i = 0; i < amountForChecking; i++) {
        const currentCheckingIdx = getNextGridFn(initGridIdx, i);
        // console.log(gridState[currentCheckingIdx], currentPlayer)
        if(gridState[currentCheckingIdx] === player) {
          sameRowMatched += 1;
          matchedIdxList.push(currentCheckingIdx);
        } else {
          if(!gridState[currentCheckingIdx]) {
            notMatchedAndEmptyIdxList.push(currentCheckingIdx)
          }
        }
      }
      // console.log(sameRowMatched)
      if(sameRowMatched == amountForMatching) {
        return ({
          matchedIdxList,
          notMatchedAndEmptyIdxList,
        });
      }
      return false;
    }
  }

  // 將"找其中一種贏的狀況"獨立成函式
  const checkSingleWinSituation = checkSingleMatchSituation(AMOUNT_FOR_WINNING, 3);

  function checkPlayerMatchCondition(checkMatchFn = checkSingleWinSituation) {
    return (gridIndex, player) => {
      // 先找該格子的"二維"座標

      const gridRow = Math.floor(gridIndex / 3);
      const gridColumn = gridIndex % 3;
      // console.log(gridRow, gridColumn)

      // 橫向
      // 找到該排的"最左邊"往右邊找(也可以從最右邊往左邊找)
      const mostLeftGridIdx = gridRow * 3;
      const getRightGridIdx = (init, i) => (
        init + i
      )
      const rowChecked = checkMatchFn(mostLeftGridIdx, player, getRightGridIdx);
      if(rowChecked) {
        return ({
          type: 'ROW',
          result: rowChecked,
        });
      }

      // 直向
      // 找到該行的"最上面"往下找(也可以從最下往上找)
      const mostTopGridIdx = gridColumn;
      const getBottomGridIdx = (init, i) => (
        init + i * 3
      )
      const columnChecked = checkMatchFn(mostTopGridIdx, player, getBottomGridIdx);
      if(columnChecked) {
        return ({
          type: 'COLUMN',
          result: columnChecked,
        });
      }

      // 斜向(右上 -> 左下)
      // 只有2, 4, 6需要這樣做
      const topRightIdx = 2;
      const getNextLeftBottomIdx = (init, i) => (
        init - i + 3 * i
      )
      const topRightChecked = checkMatchFn(topRightIdx, player, getNextLeftBottomIdx);
      if(topRightChecked) {
        return ({
          type: 'TOP_RIGHT',
          result: topRightChecked,
        });
      }

      // 斜向(左上 -> 右下)
      // 只有0, 4, 8需要這樣做
      const topLeftIdx = 0;
      const getNextTopRightIdx = (init, i) => (
        init + i + 3 * i
      )
      const topLeftChecked = checkMatchFn(topLeftIdx, player, getNextTopRightIdx);
      if(topLeftChecked) {
        return ({
          type: 'TOP_LEFT',
          result: topLeftChecked,
        });
      }

      return false;
    }
  }

  const checkPlayerWin = checkPlayerMatchCondition(checkSingleWinSituation);

  // --------------------------------------------------
  // 新增"電腦"AI

  // 新增"找哪個格子"會贏
  const checkSingleAlmostWinSituation = checkSingleMatchSituation(2);
  const checkALmostWin = checkPlayerMatchCondition(checkSingleAlmostWinSituation);

  function getEmptyGridIdx() {
    for (let i = 0; i < 9; i++) {
      if(!gridState[i]) return i;
    }
    return -1;
  }

  function findGridToWin(playerGridIdx, player) {
    const matchedGridList = checkALmostWin(playerGridIdx, player);
    if(matchedGridList) {
      return matchedGridList.result.notMatchedAndEmptyIdxList[0];
    }
    return false;
  }

  function computerPlayToStopPlayerWin(playerGridIdx = 0) {
    // 檢查玩家的格子
    const foundResult = findGridToWin(playerGridIdx, player1);
    if(foundResult) {
      return foundResult;
    }
    return false;
  }

  function computerPlayToWin() {
    // 檢查自己"所有"的格子
    for (let i = 0; i < player2GridState.length; i++) {
      const gridIdx = player2GridState[i];
      const found = findGridToWin(gridIdx, player2);
      if(found) {
        return found;
      }
    }
    return false;
  }

  function computerPlay(playerIdx) {
    console.log('computer play');
    let computerGridIdx = undefined;
    // 遊戲剛開始
    if(typeof playerIdx === 'number') {
      // 先贏再說
      const toWinPlaced = computerPlayToWin();
      if(toWinPlaced) {
        computerGridIdx = toWinPlaced;
      } else {
        // 接著
        const stopPlayerToWinPlaced = computerPlayToStopPlayerWin(playerIdx);
        computerGridIdx = stopPlayerToWinPlaced;
      }
    }

    if(!computerGridIdx) {
      computerGridIdx = getEmptyGridIdx();
    }
    console.log(computerGridIdx);

    // 更新格子與畫面
    playTikTacToe(computerGridIdx);
    updateGrid(gridList[computerGridIdx], player2);

    // 確認輸贏
    const finalResult = checkAndUpdateFinalResult(computerGridIdx);
    if(finalResult) return;

    // 交換玩家
    changePlayer();
  }

  function checkDraw(checkedResult) {
    // console.log(placedGridAmount);
    if(checkedResult === false && placedGridAmount === 9) {
      return 'DRAW';
    }
    return false;
  }

  // 當遊戲結束時，清掉該輪遊戲的"遊戲狀態"
  function resetGameStatus() {
    currentPlayer = initPlayer;
    gridState = [];
    placedGridAmount = 0;
    gameResult = undefined;
  }

  // --------------------------------------------------
  // 更新畫面

  // 根據玩家是OO還是XX，產出O或X
  function makeOOXX(player) {
    if(player === CIRCLE) {
      return 'O';
    } else {
      return 'X';
    }
  }

  function makePlayerText(player) {
    return player === player1 ? 'Player' : 'PC'
  }

  // 更新格子

  function updateGrid(gridEl, player) {
    // 把OO or XX，"放進"格子裡
    gridEl.innerText = makeOOXX(player);
    gridEl.setAttribute('meta', player);
  }

  // 更新結果
  function updateResult(result) {
    if(result === 'DRAW') {
      resultEl.innerText = '平手!';
      return;
    }
    if(result === player1 || result === player2) {
      resultEl.innerText = `${makePlayerText(result)} WIN!`;
      return;
    }
    if(result) {
      resultEl.innerText = result;
    }
  }

  function updateCurrentPlayerText() {
    currentPlayerEl.innerText = makePlayerText(currentPlayer);
  }

  function initUI() {
    updateCurrentPlayerText();
  }

  function resetResult() {
    resultEl.innerText = ''
  }

  // 從頭開始
  // 清掉其中一格的OOXX
  function resetSingleGrid(gridEl = document.createElement('div')) {
    gridEl.innerText = '';
    gridEl.removeAttribute('meta');
  }

  // 清掉所有的格子
  const resetGridList = (gridList) => {
    for (let i = 0; i < gridList.length; i++) {
      const grid = gridList[i];
      resetSingleGrid(grid);
    }
  }

  const resetCurrentPlayerText = () => {
    currentPlayerEl.innerText = '';
  }

  function resetUI() {
    resetGridList(gridList);
    resetResult();
    resetCurrentPlayerText();
  }

  // --------------------------------------------------

  function startGame() {
    getRandomPlayer();
    if(currentPlayer === player2) {
      computerPlay();
    } 
    updateCurrentPlayerText();
  }

  function resetGame() {
    resetGameStatus();
    resetUI();
  }

  function checkAndUpdateFinalResult(currentGridIdx = 0) {
    if(typeof currentGridIdx !== 'number') return false;
    const checkedResult = checkPlayerWin(currentGridIdx, currentPlayer);
    const checkedDraw = checkDraw(checkedResult);
    // console.log(checkedResult);

    if(checkedResult) {
      updateResult(currentPlayer);
      gameResult = checkedResult;
      return currentPlayer;
    }
    if(checkedDraw) {
      updateResult(checkedDraw);
      return currentPlayer;
    }

    return false;
  }

  // 在網頁的格子"註冊"點擊事件，每次點擊都觸發"玩圈圈叉叉"
  function registerBehaviors() {
    for (let i = 0; i < gridList.length; i++) {
      const grid = gridList[i];
      grid.addEventListener('click', () => {
        // console.log(gameResult);
        if(currentPlayer !== player1) return;
        if(gameResult) return;

        const played = playTikTacToe(i);
        // console.log(played);
        if(played) {
          updateGrid(grid, played);
          const finalResult = checkAndUpdateFinalResult(i);
          console.log(finalResult)

          if(finalResult) return;
          // 交換玩家
          changePlayer();
          // 換電腦玩
          computerPlay(i);
        }
      })
    };

    startButton.addEventListener('click', startGame)
    resetButton.addEventListener('click', resetGame);
  }

  function main() {
    // initUI();
    registerBehaviors();
  }

  main();
})()