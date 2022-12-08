import chess

board = chess.Board()
legal_moves = list(board.legal_moves)
moves_len = len(legal_moves)
for i in range(moves_len):
    board.push(legal_moves[i])
    print(board)
    board.pop()
