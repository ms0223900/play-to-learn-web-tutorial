function checkSingleMatchSituation(amountForMatching = 3, amountForChecking = 3, gridState, minEmptyAmount = 0) {
  return function(initGridIdx, player, getNextGridFn = (initIdx, i) => initIdx) {
    let sameRowMatched = 0;
    let emptyGridAmount = 0;
    let matchedIdxList = [];
    let notMatchedAndEmptyIdxList = [];

    for (let i = 0; i < amountForChecking; i++) {
      const currentCheckingIdx = getNextGridFn(initGridIdx, i);
      console.log('gridState: ', gridState, player, currentCheckingIdx);
      const currentGrid = gridState[currentCheckingIdx];
      if(currentGrid) {
        if(currentGrid === player) {
          sameRowMatched += 1;
          matchedIdxList.push(currentCheckingIdx);
        }
      } else {
        notMatchedAndEmptyIdxList.push(currentCheckingIdx);
        emptyGridAmount += 1;
      }
    }
    // console.log(sameRowMatched, amountForMatching);
    if(sameRowMatched == amountForMatching && emptyGridAmount >= minEmptyAmount) {
      return ({
        matchedIdxList,
        notMatchedAndEmptyIdxList,
      });
    }
    return false;
  }
}

function checkPlayerMatchCondition(rowAmout = 3, columnAmount = 3, checkMatchFn) {
  return (gridIndex, player) => {
    // 先找該格子的"二維"座標

    const gridRow = Math.floor(gridIndex / columnAmount);
    const gridColumn = gridIndex % columnAmount;
    // console.log(gridRow, gridColumn)

    // 橫向
    // 找到該排的"最左邊"往右邊找(也可以從最右邊往左邊找)
    const mostLeftGridIdx = gridRow * columnAmount;
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
      init + i * columnAmount
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
      init - i + columnAmount * i
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
    const getNextBottomRightIdx = (init, i) => (
      init + i + columnAmount * i
    )
    const topLeftChecked = checkMatchFn(topLeftIdx, player, getNextBottomRightIdx);
    if(topLeftChecked) {
      return ({
        type: 'TOP_LEFT',
        result: topLeftChecked,
      });
    }

    return false;
  }
}

class GridFinder {
  constructor(getGridStateFn = () => [], gridRow = 3, gridColumn = 3, amoutForWining = 3, ) {
    this.row = gridRow;
    this.column = gridColumn;
    this.amoutForWining = amoutForWining;
    this.allGridAmount = this.row * this.column;
    this.getGridState = () => getGridStateFn();

    this.checkSingleWinSituationFn = (...params) => checkSingleMatchSituation(
      this.amoutForWining, this.amoutForWining, this.getGridState(),
    )(...params);
    this.checkSinglePlayerAlmostWinFn = (...params) => checkSingleMatchSituation(
      this.amoutForWining - 1, this.amoutForWining, this.getGridState(), 1,
    )(...params);

    this.checkPlayerWin = checkPlayerMatchCondition(
      this.row, this.column, this.checkSingleWinSituationFn,
    );
    this.checkPlayerAlmostWin = checkPlayerMatchCondition(
      this.row, this.column, this.checkSinglePlayerAlmostWinFn,
    );
  }

  findSingleGridToWin(gridIdx, player) {
    const matchedRes = this.checkPlayerAlmostWin(gridIdx, player);
    if(matchedRes) {
      console.log(matchedRes.result)
      const emptyIdx = matchedRes.result.notMatchedAndEmptyIdxList[0];
      if(typeof emptyIdx === 'number') return emptyIdx;
    }
    return -1;
  }

  findSelfAllGridToWin(selfAllGridList = [3, 2, 1], currentPlayer) {
    // console.log(selfAllGridList, currentPlayer);
    for (let i = 0; i < selfAllGridList.length; i++) {
      const gridIdx = selfAllGridList[i];
      const foundIdx = this.findSingleGridToWin(gridIdx, currentPlayer);
      if(typeof foundIdx !== -1) {
        return foundIdx;
      }
    }
    return -1;
  }

  findEmptyGridIdx(gridState = []) {
    for (let i = 0; i < this.allGridAmount; i++) {
      if(!gridState[i]) return i;
    }
    return -1;
  }

  getBestGridIdxSolution({
    prevTurnPlayerRecord = undefined,
    currentPlayer = '',
    selfAllGridList = [],
    allGridList = [],
  }) {
    // console.log(prevTurnPlayerRecord, selfAllGridList, this.getGridState());
    let gridIdxRes = this.findEmptyGridIdx(allGridList);
    if(!selfAllGridList.length || !prevTurnPlayerRecord) return gridIdxRes;
    const playerWinRes = this.findSelfAllGridToWin(
      selfAllGridList,
      currentPlayer,
    );
    console.log(playerWinRes);
    if(playerWinRes !== -1) {
      return playerWinRes;
    }

    if(prevTurnPlayerRecord) {
      const {
        player, gridIdx
      } = prevTurnPlayerRecord;
      const found = this.findSingleGridToWin(gridIdx, player);
      console.log(found);
      if(found !== -1) return found;
    }
    console.log(gridIdxRes);
    return gridIdxRes;
  }
}

export default GridFinder;