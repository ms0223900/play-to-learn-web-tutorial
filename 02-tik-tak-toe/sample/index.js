(() => {
  // 先抓取網頁上的元件
  const resultEl = document.getElementById('result')
  const startResetButton = document.getElementById('startReset');
  const gridList = document.getElementsByClassName('grid');

  // 設定好數值
  
  const CIRCLE = 'CIRCLE';
  const CROSS = 'CROSS';
  
  const player1 = CIRCLE;
  const player2 = CROSS;
  const initPlayer = player1;
  
  let gameResult = undefined;
  let currentPlayer = initPlayer;
  let gridState = [];
  let player1GridState = [];
  let player2GridState = [];
  let placedGridAmount = 0;

  // --------------------------------------------------
  // 遊戲邏輯

  // 交換玩家
  function changePlayer() {
    if(currentPlayer === player1) {
      currentPlayer = player2;
    } else {
      currentPlayer = player1;
    }
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

  // 方法1
  // 根據"已知"的所有可能(即3個連成一線)，去找目前玩家的格子是否有符合的!
  const allWinPosibilities = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6],
  ];

  function getPlayerGridState() {
    if(currentPlayer === player1) {
      return player1GridState.sort();
    }
    return player2GridState.sort();
  }

  function checkPlayerWin() {
    // 找到該回合下棋的玩家"所有OO or XX"
    const allCurrentPlayerGrid = getPlayerGridState()
    
    // 根據已知"贏"的可能，一一比對該玩家是否符合贏的條件
    for (let i = 0; i < allWinPosibilities.length; i++) {
      const posibility = allWinPosibilities[i];
      
      // 將兩個陣列做"一致"的比較，其中一個方式就是讓其變成"字"，像是[0, 1, 2]變成"0,1,2"，跟[2, 3, 4]變成的"2,3,4"做比較
      const posibilityStr = posibility.join(',');
      const playerGridStr = allCurrentPlayerGrid.join(',');
      if(posibilityStr === playerGridStr) {
        return currentPlayer;
      }
    }

    return false;
  }

  // 方法2
  // 這方法比較困難，雖然"效率"與方法1差不多
  // 但可以應用於"格子數量"遠比這還多的棋盤遊戲(例如圍棋、五子棋)
  // 根據玩家下的"格子"，去尋找橫向、直向和斜方向的格子

  // 要先知道如何將儲存的格子[] -> 轉變成像是棋盤的"二維"結構
  // [
  //   [0, 1, 2],
  //   [3, 4, 5],
  //   [6, 7, 8],
  // ]
  function checkPlayerWin(gridIndex) {
    const AMOUNT_FOR_WINNING = 3;

    // 先找該格子的"二維"座標
    const gridRow = Math.floor(gridIndex / 3);
    const gridColumn = gridIndex % 3;
    // console.log(gridRow, gridColumn)

    // 橫向
    // 找到該排的"最左邊"往右邊找(也可以從最右邊往左邊找)
    const mostLeftGridIdx = gridRow * 3;
    let sameRowMatched = 0;
    for (let i = 0; i < AMOUNT_FOR_WINNING; i++) {
      const currentCheckingIdx = mostLeftGridIdx + i;
      // console.log(gridState[currentCheckingIdx], currentPlayer)
      if(gridState[currentCheckingIdx] === currentPlayer) {
        sameRowMatched += 1;
      }
    }
    // console.log(sameRowMatched)
    if(sameRowMatched == AMOUNT_FOR_WINNING) {
      return currentPlayer;
    }

    // 直向
    // 找到該行的"最上面"往下找(也可以從最下往上找)
    const mostTopGridIdx = gridColumn;
    let sameColumnMatched = 0;
    for (let i = 0; i < AMOUNT_FOR_WINNING; i++) {
      const currentCheckingIdx = mostTopGridIdx + i * 3;
      if(gridState[currentCheckingIdx] === currentPlayer) {
        sameColumnMatched += 1;
      }
    }
    if(sameColumnMatched == AMOUNT_FOR_WINNING) {
      return currentPlayer;
    }

    // 斜向(右上 -> 左下)
    // 只有2, 4, 6需要這樣做
    const topRightIdx = 2;
    let topRightMatched = 0;
    for (let i = 0; i < 3; i++) {
      const currentCheckingIdx = topRightIdx - i + 3 * i;
      if(gridState[currentCheckingIdx] === currentPlayer) {
        topRightMatched += 1;
      }
    }
    if(topRightMatched === AMOUNT_FOR_WINNING) {
      return currentPlayer;
    }

    // 斜向(左上 -> 右下)
    // 只有0, 4, 8需要這樣做
    const topLeftIdx = 0;
    let topLeftMatched = 0;
    for (let i = 0; i < 3; i++) {
      const currentCheckingIdx = topLeftIdx + i + 3 * i;
      if(gridState[currentCheckingIdx] === currentPlayer) {
        topLeftMatched += 1;
      }
    }
    if(topLeftMatched === AMOUNT_FOR_WINNING) {
      return currentPlayer;
    }

    return false;
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
    if(result === player1) {
      resultEl.innerText = 'PLAYER 1 WIN!';
      return;
    }
    if(result === player2) {
      resultEl.innerText = 'PLAYER 2 WIN!';
      return;
    }
    if(result) {
      resultEl.innerText = result;
    }
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

  function resetUI() {
    resetGridList(gridList);
    resetResult();
  }

  // --------------------------------------------------

  // 在網頁的格子"註冊"點擊事件，每次點擊都觸發"玩圈圈叉叉"

  function registerBehaviors() {
    for (let i = 0; i < gridList.length; i++) {
      const grid = gridList[i];
      grid.addEventListener('click', () => {
        // console.log(gameResult);
        if(gameResult) return;
        const played = playTikTacToe(i);
        // console.log(played);

        if(played) {
          updateGrid(grid, played);
          const checkedResult = checkPlayerWin(i);
          const checkedDraw = checkDraw(checkedResult);
          // console.log(checkedResult);

          if(checkedResult) {
            updateResult(checkedResult);
            gameResult = checkedResult;
          }
          if(checkDraw) {
            updateResult(checkedDraw)
          }

          // 交換玩家
          changePlayer();
        }
      })
    };

    startResetButton.addEventListener('click', () => {
      resetGameStatus();
      resetUI();
    })
  }

  function main() {
    registerBehaviors();
  }

  main();
})()