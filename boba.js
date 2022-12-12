let board = null;

const piece_values = {
    'p': 1,
    'n': 3,
    'b': 3,
    'r': 5,
    'q': 9,
    'k': 1000,
};

let unmoved = ['p', 'n', 'b', 'r', 'q'];

//import { Chess } from 'chess.js';
async function run(newBoard, player) {
    board = newBoard;
    const chess = new Chess();
    // setTimeout(() => {
    //     board.move('e2-e4')
    // }, 2000)
    while (!chess.game_over()) {
        if(player === chess.turn()) {
            let mv = moveSelection(chess, 4); // this is returning infinity or -0 or 2 somehow
            // move_scores.sort((a, b) => {
            //     return b.scores - a.scores;
            // })
            // let goodMoves = countSameValues(move_scores) + 1;
            // chess.move(move_scores[Math.floor(Math.random() * goodMoves)].move);
            let moveInfo = moveParse(mv);
            if(unmoved.includes(moveInfo.piece)){
                const index = unmoved.indexOf(moveInfo.piece);
                unmoved.splice(index, 1);
            }
            chess.move(mv);
            board.position(chess.fen());
        }
        else{
            // The Following Allows User Input:
            console.log(chess.moves());
            const opp_move = prompt("Your move: ");
            if(chess.moves().includes(opp_move)){
                chess.move(opp_move);
                board.position(chess.fen());
            }
            else{
                console.log("Invalid Move!");
            }
            // const moves = chess.moves();
            // chess.move(moves[Math.floor(Math.random() * moves.length)]);
            // board.position(chess.fen());
        }
        await new Promise((res, rej) => {
            setTimeout(() => {
                res();
            }, 500);
        });
    }
    console.log(chess.pgn());
}

function basicEval(chess){
    if(chess.in_draw()) {
        return 0;
    }
    if(chess.game_over()){
        return -100000;
    }
    let player = chess.turn();
    let score = 0;
    for(let row of chess.board()) {
        for(let col of row) {
            if(col != null) {
                if(col.color === player){
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

function moveOrdering(a, b) {
    let aMove = moveParse(a);
    let bMove = moveParse(b);
    let aScore = 0;
    let bScore = 0;
    
    if(aMove.checkmate === true) {
        aScore += 1000;
    }
    if(aMove.check === true) {
        aScore += 100;
    }
    if(aMove.capture === true) {
        aScore += 10;
    }
    if(unmoved.includes(aMove.piece)) {
        aScore += 5;
    }

    if(bMove.checkmate === true) {
        bScore += 1000;
    }
    if(bMove.check === true) {
        bScore += 100;
    }
    if(bMove.capture === true) {
        bScore += 10;
    }
    if(unmoved.includes(bMove.piece)) {
        bScore += 5;
    }

    return bScore - aScore;
}

function moveParse(move) {
    let mv = move;
    let capture = false;
    let square = "";
    let piece = "";
    let check = false;
    let checkmate = false;
    if(mv.charAt(0) === mv.charAt(0).toUpperCase()){
        piece = mv.charAt(0).toLowerCase();
        mv = mv.substring(1);
    }
    else{
        piece = "p";
    }
    if(mv.includes("x")){
        capture = true;
        let findX = mv.indexOf("x");
        square = mv.substring(findX+1, findX+3);
    }
    else{
        square = mv.substring(0,2);
    }
    if(mv.includes("+")){
        check = true;
    }
    if(mv.includes("#")) {
        checkmate = true;
    }

    let obj = {
        capture,
        square,
        piece,
        check,
        checkmate
    };

    return obj;
}

function moveSelection(chess, depth) {
    let moveSelected = "";
    let calculated = 0;
    alphaBetaMax(-Infinity, Infinity, depth, true);

    function alphaBetaMax(alpha, beta, depthLeft, first) {
        if(calculated > 1000000 || chess.game_over()) {
            depthLeft = 0;
        }
        if (depthLeft === 0) {
            return basicEval(chess);
        }
        const moves = chess.moves();
        if(first) {
            moves.sort((a, b) => moveOrdering(a, b));
        }
        for (let move of moves) {
            calculated += 1;
            chess.move(move);
            score = alphaBetaMin(alpha, beta, depthLeft - 1);
            chess.undo();
            if(score >= beta) {
                return beta;
            }   
            if(score > alpha) {
                alpha = score;
                if(first) {
                    moveSelected = move;
                }
            }
        }
        return alpha;
    }
     
    function alphaBetaMin(alpha, beta, depthLeft) {
        if(calculated > 1000000 || chess.game_over()) {
            depthLeft = 0;
        }
        if (depthLeft === 0) {
            return -basicEval(chess);
        }
        const moves = chess.moves();
        for (let move of moves) {
            calculated += 1;
            chess.move(move);
            score = alphaBetaMax(alpha, beta, depthLeft - 1, false);
            chess.undo();
            if(score <= alpha) {
                return alpha;
            }   
            if(score < beta) {
                beta = score;
            }
        }
        return beta;
    }

    return moveSelected;
}

function getValue(piece){
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
    run(board, 'w');
};