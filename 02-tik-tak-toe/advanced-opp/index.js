import GridFinder from './GridFinder.js';

const CIRCLE = 'CIRCLE';
const CROSS = 'CROSS';

const configs = {
  AMOUNT_FOR_WINNING: 3,
  
  player1: CIRCLE,
  player2: CROSS,
  // initPlayer: player1,
};

const GAME_RESULT_TYPE = {
  DRAW: 'DRAW',
  PLAYER1: 'Player WIN',
  PLAYER2: 'PC WIN',
}

const initGameState = {
  gameResult: undefined,
  currentPlayer: undefined,
  prevTurnRecord: undefined,
  realPlayerSelected: configs.player1, // 預設玩家都是player1
  gridState: Array(9).fill(''),
  player1GridState: [],
  player2GridState: [],
  placedGridAmount: 0,
};

const GAME_STATE_UPDATE_ACTIONS = {
  'UPDATE_GRID': 'UPDATE_GRID',
  'CHANGE_PLAYER': 'CHANGE_PLAYER',
  'SET_RECORD': 'SET_RECORD',
  'SET_GAME_RESULT': 'SET_GAME_RESULT',
}

class GameUI {
  constructor() {
    this.resultEl = document.getElementById('result');
    this.currentPlayerEl = document.getElementById('currentPlayer');
    this.gridList = document.getElementsByClassName('grid');
    this.startButton = document.getElementById('start');
    this.resetButton = document.getElementById('reset');
  }

  updateCurrentPlayerText({
    currentPlayer
  }) {
    this.currentPlayerEl.innerText = currentPlayer ? (
      currentPlayer === configs.player1 ? 'Player' : 'PC'
    ) : '';
  }

  updateResult({
    gameResult
  }) {
    // console.log(gameResult);
    if(typeof gameResult === 'string') {
      this.resultEl.innerText = gameResult;
      this.updateCurrentPlayerText({
        currentPlayer: '',
      });
    } else {
      this.resultEl.innerText = '';
    }
  }

  makeGridOOXX(player) {
    return player === configs.player1 ? 'O' : 'X';
  }
  updateGrid({
    gridState,
  }) {
    // console.log('update grid', gridState);
    for (let i = 0; i < gridState.length; i++) {
      const singleGridIdx = gridState[i];
      const gridContent = singleGridIdx ? this.makeGridOOXX(singleGridIdx) : ''
      this.gridList[i].innerText = gridContent;
    }
  }

  update(props) {
    this.updateCurrentPlayerText(props);
    this.updateResult(props);
    this.updateGrid(props)
  }
}

class GameUIUpdater {
  constructor() {

  }

  update() {
    switch (key) {
      case value:
        
        break;
    
      default:
        break;
    }
  }
}

class GameState {
  constructor(uiUpdater) {
    this.state = {
      ...initGameState,
    };
    this.uiUpdater = uiUpdater;
  }

  getState() {
    return this.state;
  }

  updateUI = (options) => {
    // console.log(this.uiUpdater)
    this.uiUpdater.update(this.state, options)
  }

  setState(_newState) {
    let newState = _newState;
    if(typeof _newState === 'function') {
      newState = _newState(this.state);
    }
    this.state = {
      ...this.state,
      ...newState,
    };
    this.updateUI(this.state);
  }

  resetState() {
    this.setState({
      ...initGameState,
    });
  }

  update({ type, payload }) {
    let options = {};
    // console.log(type, payload);
    switch (type) {
      case GAME_STATE_UPDATE_ACTIONS.UPDATE_GRID: {
        const {
          player, gridIdx,
        } = payload;
        // console.log(player, gridIdx);
        const placedGridAmount = this.state.placedGridAmount + 1;
        let newGridState = [...this.state.gridState];
        newGridState[gridIdx] = player;
        if(player === configs.player1) {
          this.setState({
            player1GridState: [...this.state.player1GridState, gridIdx],
            placedGridAmount,
            gridState: newGridState,
          });
        } else {
          this.setState({
            player2GridState: [...this.state.player2GridState, gridIdx],
            placedGridAmount,
            gridState: newGridState,
          });
        }
        break;
      }

      case GAME_STATE_UPDATE_ACTIONS.SET_GAME_RESULT: {
        let resultText = payload.gameResult;
        if(payload.gameResult === configs.player1) {
          resultText = GAME_RESULT_TYPE.PLAYER1;
        }
        if(payload.gameResult === configs.player2) {
          resultText = GAME_RESULT_TYPE.PLAYER2;
        }
        // console.log(resultText);
        this.setState({
          gameResult: resultText,
        });
        break;
      }

      case GAME_STATE_UPDATE_ACTIONS.SET_RECORD: {
        this.setState({
          prevTurnRecord: payload,
        });
        break;
      }

      default: {
        this.setState({
          ...payload
        });
        break;
      }
    }
  }
}

class BasicPlayer {
  constructor(player, gameState = new GameState()) {
    this.player = player;
    this.gameState = gameState;
  }

  setPlayerRecord({ player, gridIdx, }) {
    this.gameState.update({
      type: GAME_STATE_UPDATE_ACTIONS.SET_RECORD,
      payload: {
        player,
        gridIdx,
      }
    })
  }

  checkCanPlay() {
    // console.log(this.player, this.gameState.state.currentPlayer);
    return this.player === this.gameState.state.currentPlayer && !this.gameState.getState().gameResult;
  }

  changePlayer(game) {
    const {
      currentPlayer
    } = this.gameState.state;
    const newPlayer = currentPlayer === configs.player1 ? configs.player2 : configs.player1;
    // console.log('change player: ', currentPlayer, newPlayer);
    this.gameState.update({
      type: GAME_STATE_UPDATE_ACTIONS.CHANGE_PLAYER,
      payload: {
        currentPlayer: newPlayer,
      }
    });
    game.triggerNextPlayer({
      newPlayer,
    });
  }

  getPlayedIdx(options) {
    return -1;
  }

  setGridIdx(options) {
    const playedIdx = this.getPlayedIdx(options);
    if(playedIdx !== -1) {
      this.gameState.update({
        type: GAME_STATE_UPDATE_ACTIONS.UPDATE_GRID,
        payload: {
          gridIdx: playedIdx,
          player: this.player,
        }
      });
      return playedIdx;
    }
    return false;
  }

  play(game, options = {}) {
    // console.log('computer play');
    if(!this.checkCanPlay()) return;
    const playerGridIdx = this.setGridIdx(options);
    // console.log(playerGridIdx);
    if(typeof playerGridIdx === 'number') {
      this.setPlayerRecord({ 
        player: this.player, 
        gridIdx: playerGridIdx,
      });
      const gameResult = game.checkResult(playerGridIdx);
      if(gameResult) {
        this.gameState.update({
          type: GAME_STATE_UPDATE_ACTIONS.SET_GAME_RESULT,
          payload: { gameResult, }
        });
      } else {
        this.changePlayer(game);
      }
    }
  }
}

class RealPlayer extends BasicPlayer {
  constructor(...params) {
    super(...params);
  }

  getPlayedIdx({ idx }) {
    if(this.gameState.getState().gridState[idx]) return -1;
    return idx;
  }
}

class ComputerPlayer extends BasicPlayer {
  constructor({
    gameState,
    player,
  }) {
    super(player, gameState);
    this.gridFinder = new GridFinder(
      () => this.gameState.getState().gridState,
    );
  }

  getPlayedIdx({ prevTurnPlayerGridIdx, selfAllGridList, allGridList }) {
    const {
      prevTurnRecord,
      player2GridState,
      gridState,
    } = this.gameState.state;
    const gridIdx = this.gridFinder.getBestGridIdxSolution({
      prevTurnPlayerRecord: prevTurnRecord,
      selfAllGridList: player2GridState,
      allGridList: gridState,
      currentPlayer: this.player
    });
    console.log('computer gridIdx:', gridIdx);
    return gridIdx;
  }
}

class Game {
  constructor() {
    this.gameUI = new GameUI();
    // this.gameUIUpdater = new GameUIUpdater(
    //   this.gameUI,
    // );
    this.gameState = new GameState(
      this.gameUI,
    );
    this.player1 = new RealPlayer(configs.player1, this.gameState);
    this.player2 = new ComputerPlayer({
      gameState: this.gameState,
      player: configs.player2,
    });
    this.gridFinder = new GridFinder(
      () => this.gameState.getState().gridState,
    )
  }

  registerUIBehaviors() {
    const self = this;
    this.gameUI.startButton.addEventListener('click', () => {
      this.startGame();
    });
    this.gameUI.resetButton.addEventListener('click', () => {
      this.resetGame();
    });
    for (let i = 0; i < this.gameUI.gridList.length; i++) {
      const grid = this.gameUI.gridList[i];
      grid.addEventListener('click', () => {
        this.player1.play(self, { idx: i });
      });
    }
  }

  getRandomPlayer() {
    const currentPlayer = Math.random() < 0.5 ? configs.player1 : configs.player2;
    this.gameState.update({
      type: GAME_STATE_UPDATE_ACTIONS.CHANGE_PLAYER,
      payload: { currentPlayer, }
    });
  }

  startGame() {
    // console.log('start game');
    this.getRandomPlayer();
    this.triggerNextPlayer();
  }

  resetGame() {
    this.gameState.resetState();
  }

  checkDraw() {
    console.log(this.gameState.state.placedGridAmount)
    if(this.gameState.state.placedGridAmount === 9) {
      return GAME_RESULT_TYPE.DRAW;
    }
    return false;
  }

  checkResult() {
    let result;
    const prevTurnRecord = this.gameState.getState().prevTurnRecord;
    if(prevTurnRecord) {
      const {
        player, gridIdx,
      } = prevTurnRecord;
      const playerWinResult = this.gridFinder.checkPlayerWin(
        gridIdx, player
      );
      if(playerWinResult) return player;
    }
    const isDrawRes = this.checkDraw();
    if(isDrawRes) return isDrawRes;
    return false;
  }

  triggerNextPlayer() {
    const game = this;
    if(this.gameState.state.currentPlayer === configs.player2) {
      this.player2.play(game);
    }
  }

  init() {
    this.registerUIBehaviors();
  }
}

const game = new Game();
game.init();