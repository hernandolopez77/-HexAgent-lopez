const Agent = require('ai-agents').Agent;
const boardS = require('./boardScore');
const transposeHex = require('./transposeHex');
const cloneDeep = require('lodash/cloneDeep');

class HexAgent extends Agent {
  constructor(value) {
    super(value);
    this.cache = {};
  }

  /**
   * return a new move. The move is an array of two integers, representing the
   * row and column number of the hex to play. If the given movement is not valid,
   * the Hex controller will perform a random valid movement for the player
   * Example: [1, 1]
   */
  send() {
    let board = this.perception;
    let size = board.length;
    let available = getEmptyHex(board);
    let nTurn = size * size - available.length;
    return moveGame(board, size, available, nTurn)

  }

}

module.exports = HexAgent;

/**
 * Return an array containing the id of the empty hex in the board
 * id = row * size + col;
 * @param {Matrix} board 
 */
function getEmptyHex(board) {
  let result = [];
  let size = board.length;
  for (let k = 0; k < size; k++) {
    for (let j = 0; j < size; j++) {
      if (board[k][j] === 0) {
        result.push(k * size + j);
      }
    }
  }
  return result;
}


function moveGame(board, size, available, nTurn) {
  if (nTurn == 0) {
    return [Math.floor(size / 2), Math.floor(size / 2) - 1];
  } else if (nTurn == 1) {
    return [Math.floor(size / 2), Math.floor(size / 2)];
  }

  let profundidad = 7;

  if (nTurn % 2 == 0) {
    let [evaluation, bestMove] = minmax(board, profundidad, true)
    let [row, col] = bestMove;
    return [row, col];
  } else {
    board = transposeHex(board)
    let [evaluation, bestMove] = minmax(board, profundidad, true)
    let [row, col] = bestMove;
    return [col, row];
  }

}


function twoBridgesScore(board, player) {
  let path0 = boardS.boardPath(board);
  let path1 = boardS.boardPath(transposeHex(board));
  let twoBridges = 0;
  let twoBridgesAdversary = 0;
  path0.forEach(squareId => {
    let row = Math.floor(squareId / board.length)
    let col = squareId % board.length
    if(board[row-1][col+2] === player) twoBridges++;
    if(board[row+1][col-2] === player) twoBridges++;
    if(board[row-1][col-1] === player) twoBridges++;
    if(board[row+1][col+1] === player) twoBridges++;
    if(board[row+2][col-1] === player) twoBridges++;
    if(board[row-2][col+1] === player) twoBridges++;
  })

  path1.forEach(squareId => {
    let row = Math.floor(squareId / board.length)
    let col = squareId % board.length
    if (board[row-1][col+2] !== player && board[row-1][col+2] !== 0) twoBridgesAdversary++;
    if (board[row+1][col-2] !== player && board[row+1][col-2] !== 0) twoBridgesAdversary++;
    if (board[row-1][col-1] !== player && board[row-1][col-1] !== 0) twoBridgesAdversary++;
    if (board[row+1][col+1] !== player && board[row+1][col+1] !== 0) twoBridgesAdversary++;
    if (board[row+2][col-1] !== player && board[row+2][col-1] !== 0) twoBridgesAdversary++;
    if (board[row-2][col+1] !== player && board[row-2][col+1] !== 0) twoBridgesAdversary++;       
  })
  score = twoBridges-twoBridgesAdversary;          
  
  return player === '1' ? score : -score;
}
/*

*/
let contadorIteraciones = 0;
function centralControlScore(board, player){

  let path0 = boardS.boardPath(board);
  let path1 = boardS.boardPath(transposeHex(board));

  // let control = 0;
  // let controlAdversary = 0;

  // path0.forEach(squareId => {
  //   let row = Math.floor(squareId / board.length)
  //   let col = squareId % board.length
  //   if (row >= 3 && row <= 7 && col >= 3 && col <= 6) control++;
  // })
  // path1.forEach(squareId => {
  //   let row = Math.floor(squareId / board.length)
  //   let col = squareId % board.length
  //   if (row >= 3 && row <= 7 && col >= 3 && col <= 6) controlAdversary++;
  // })
  // score = control-controlAdversary;          
  
  // return player === '1' ? score : -score;
}

function minmax(board, profundidad, maxplayer, alfa = Number.MIN_SAFE_INTEGER, beta = Number.MAX_SAFE_INTEGER) {

  if(maxplayer){
    let movements = boardS.boardPath(board)
    if(movements === null){
      return [boardS.boardScore(board, '1'), null]
    }else{
      if(profundidad === 0 || movements.length === 2){
        return [boardS.boardScore(board, '1'), null]
      }
    }
  }else {    
      let movements = boardS.boardPath(transposeHex(board))
      if(movements === null){
        return [boardS.boardScore(board, '2'), null]
      }else
        if(profundidad === 0 || movements.length === 2) {
        return [boardS.boardScore(board, '2'), null];
      }
    
  }
  


  if (maxplayer) {
    let max_eval = Number.NEGATIVE_INFINITY;
    let bestMove = null;
    let possibleMoves = boardS.boardPath(board);
    let startIndex = 1; 
    let endIndex = possibleMoves.length - 1; 
    
    for (let i = startIndex; i < endIndex; i++) {
      const squareId = possibleMoves[i];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length
      let temp_board = cloneDeep(board);
      temp_board[row][col] = '1'
      let evaluation = minmax(temp_board, profundidad - 1, false, alfa, beta)[0]
      if(evaluation > max_eval){
        max_eval = evaluation;
        bestMove = [row, col];
      }
      alfa = Math.max(alfa, evaluation);
      if (beta <= alfa) {
        break;
      }
    }
    return [max_eval, bestMove];    
 
  } else {
    let min_eval = Number.POSITIVE_INFINITY;
    let bestMove = null;
    let possibleMoves = boardS.boardPath(transposeHex(board));
    let startIndex = 1; 
    let endIndex = possibleMoves.length - 1; 

    for(let j = startIndex; j < endIndex; j++){
      let squareId = possibleMoves[j];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length
      let newId = col * board.length + row;
      possibleMoves[j] = newId;
    }
    
    for (let i = startIndex; i < endIndex; i++) {
      const squareId = possibleMoves[i];
      let row = Math.floor(squareId / board.length)
      let col = squareId % board.length
      let temp_board = cloneDeep(board);
      temp_board[row][col] = '2'
      let evaluation = minmax(temp_board, profundidad - 1, true, alfa, beta)[0]
      if (evaluation < min_eval) {
        min_eval = evaluation;
        bestMove = [row, col];
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alfa) {
        break; 
      }
    }
    return [min_eval, bestMove];
  }
}
