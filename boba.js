let board = null;

const piece_values = {
    'p': 1,
    'n': 3,
    'b': 3,
    'r': 5,
    'q': 9,
    'k': 1000,
};

//import { Chess } from 'chess.js';
async function run(newBoard) {
    board = newBoard;
    const chess = new Chess();
    // setTimeout(() => {
    //     board.move('e2-e4')
    // }, 2000)
    while (!chess.game_over()) {
        const moves = chess.moves();
        let move_scores = [];
        for(let move of moves) {
            chess.move(move);
            move_scores.push({move, scores: basicEval(chess)});
            chess.undo();
        }
        move_scores.sort((a, b) => {
            return b.scores - a.scores;
        })
        console.log(move_scores[0].scores);
        // const move = moves[Math.floor(Math.random() * moves.length)];
        let goodMoves = countSameValues(move_scores) + 1;
        chess.move(move_scores[Math.floor(Math.random() * goodMoves)].move);
        board.position(chess.fen());
        await new Promise((res, rej) => {
            setTimeout(() => {
                basicEval(chess);
                res();
            }, 2000);
        });
    }
    console.log(chess.pgn());
}

function basicEval(chess, count=0, stop=false){
    if(count < 2){
        let res = runTwo(chess, count);
        return -res;
    }
    let nextTurn = chess.turn();
    let score = 0;
    for(let row of chess.board()) {
        for(let col of row) {
            if(col != null) {
                if(col.color !== nextTurn){
                    score += getValue(col.type); 
                }
                else{
                    score -= getValue(col.type);
                }
            }
        }
    }
    return score;
}

function runTwo(chess, count) { // the issue here is checking the king makes pieces think they get pieces back because only 3 move predictions
    const moves = chess.moves();
    let move_scores = [];
    for(let move of moves) {
        chess.move(move);
        move_scores.push({move, scores: basicEval(chess, count+1, true)});
        chess.undo();
    }
    move_scores.sort((a, b) => {
        return b.scores - a.scores;
    })
    return move_scores[0].scores;
}

function getValue(piece){
    console.log(piece_values[piece]);
    return piece_values[piece];
}

function countSameValues(arr){
    let len = arr.length;
    let val = arr[0].scores;
    for(let i = 0; i < len; i++){
        if(arr[i].scores !== val){
            return i;
        }
    }
    return len-1;
}

window.onload = () => {
    let board = Chessboard('board', 'start');
    run(board);
};