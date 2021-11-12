
const CIRCLE = 'CIRCLE';
const CROSS = 'CROSS';

const configs = {
  AMOUNT_FOR_WINNING: 3,
  
  player1: CIRCLE,
  player2: CROSS,
  // initPlayer: player1,
};

const initGameState = {
  gameResult: undefined,
  currentPlayer: undefined,
  prevTurnRecord: undefined,
  realPlayerSelected: configs.player1, // 預設玩家都是player1
  gridState: [],
  player1GridState: [],
  player2GridState: [],
  placedGridAmount: 0,
};

const GAME_STATE_UPDATE_ACTIONS = {
  'UPDATE_GRID': 'UPDATE_GRID',
  'CHANGE_PLAYER': 'CHANGE_PLAYER',
  'SET_RECORD': 'SET_RECORD',
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
    this.currentPlayerEl.innerText = currentPlayer;
  }

  updateResult({
    gameResult
  }) {
    this.resultEl.innerText = gameResult;
  }

  update(props) {
    this.updateCurrentPlayerText(props);
    this.updateResult(props);
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

  updateUI(options) {
    this.uiUpdater.update(this.state, options)
  }

  setState(_newState) {
    this.state = {
      ...this.state,
      ..._newState,
    };
    this.updateUI(this.state);
  }

  resetState() {
    this.setState({
      ...initGameState,
    })
  }

  update(type, payload) {
    let options = {};
    switch (type) {
      case GAME_STATE_UPDATE_ACTIONS.UPDATE_GRID: {
        const {
          player, gridIdx,
        } = payload;
        const placedGridAmount = this.placedGridAmount + 1;
        // if(player === )
        this.setState({
          player1GridState: [],
          player2GridState: [],
          placedGridAmount,
        })
        break;
      }
      default:
        break;
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
    return this.player === this.gameState.state.currentPlayer;
  }

  changePlayer(game) {
    const {
      currentPlayer
    } = this.gameState;
    const newPlayer = currentPlayer === configs.player1 ? configs.player2 : configs.player1;
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

  }

  setGridIdx(options) {
    const playedIdx = this.getPlayedIdx(options);
    if(playedIdx !== -1) {
      this.gameState.update({
        type: GAME_STATE_UPDATE_ACTIONS.UPDATE_GRID,
        payload: {
          idx: playedIdx,
          player: this.player,
        }
      });
      return setGridIdx;
    }
    return false;
  }

  play(game, options = {}) {
    if(!this.checkCanPlay()) return;
    const playerGridIdx = this.setGridIdx(options);
    if(typeof playerGridIdx === 'number') {
      this.setPlayerRecord({ 
        player: this.player, 
        gridIdx: playerGridIdx,
      });
      const result = game.checkResult(playerGridIdx);
      if(!result) {
        this.changePlayer(game);
      }
    }
  }
}

class GridFinder {
  constructor() {

  }

  findEmptyGridIdx(gridState = []) {
    for (let i = 0; i < 9; i++) {
      if(!gridState[i]) return i;
    }
    return -1;
  }

  getBestGridIdxSolution({
    prevTurnPlayerGridIdx = -1,
    selfAllGridList = [],
    allGridList = [],
  }) {
    return this.findEmptyGridIdx(allGridList);
  }
}

class RealPlayer extends BasicPlayer {
  constructor(...params) {
    super(...params);
  }

  getPlayedIdx({ idx }) {
    return ({ idx });
  }
}

class ComputerPlayer extends BasicPlayer {
  constructor() {
    super();
    this.gridFinder = new GridFinder();
  }

  getPlayedIdx({ prevTurnPlayerGridIdx }) {
    return this.gridFinder.getBestGridIdxSolution({
      prevTurnPlayerGridIdx,
      selfAllGridList,
      allGridList,
    })
  }
}

class Game {
  constructor() {
    this.gameUI = new GameUI();
    this.gameUIUpdater = new GameUIUpdater(
      this.gameUI,
    );
    this.gameState = new GameState(
      this.gameUIUpdater,
    );
    this.player1 = new RealPlayer(configs.player1, this.gameState);
    this.player2 = new ComputerPlayer(configs.player2, this.gameState);
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
      })
    }
  }

  getRandomPlayer() {
    const currentPlayer = Math.random() < 0.5 ? configs.player1 : configs.player2;
    this.gameState.update(
      GAME_STATE_UPDATE_ACTIONS.CHANGE_PLAYER,
      { currentPlayer, }
    );
  }

  startGame() {
    this.getRandomPlayer();
    this.triggerNextPlayer();
  }

  resetGame() {

  }

  checkResult() {

    return false;
  }

  triggerNextPlayer() {
    if(this.gameState.state.currentPlayer === configs.player1) {
      this.player2.play(this);
    }
  }

  init() {
    this.registerUIBehaviors();
  }
}

const game = new Game();
game.init();