import { ChessGame } from "@/lib/chess/game"
import { getAllValidMoves } from "@/lib/chess/moves"
import {
	getAllCaptureMoves,
	getAllNonCaptureMoves,
	moveToAlgebraic,
	movesToAlgebraic
} from "@/lib/chess/moves"
import {
	getBestMove,
	getBestMoveFromList
} from "@/lib/chess/strategy/stockfish"

export const berserkMove = async (fen: string, signal: AbortSignal) => {
	const chessboard = new ChessGame(fen)

	const captureMoves = getAllCaptureMoves(chessboard.getState())

	if (captureMoves.length === 1)
		return moveToAlgebraic(chessboard.getState(), captureMoves[0])

	if (captureMoves.length > 1)
		return await getBestMoveFromList({
			fen,
			moves: movesToAlgebraic(chessboard.getState(), captureMoves),
			signal
		})

	return await getBestMove({ fen, maxTime: 100, signal })
}

export const pacifistMove = async (fen: string, signal: AbortSignal) => {
	const chessboard = new ChessGame(fen)

	const nonCaptureMoves = getAllNonCaptureMoves(chessboard.getState())

	if (nonCaptureMoves.length === 1)
		return moveToAlgebraic(chessboard.getState(), nonCaptureMoves[0])

	if (nonCaptureMoves.length > 1)
		return await getBestMoveFromList({
			fen,
			moves: movesToAlgebraic(chessboard.getState(), nonCaptureMoves),
			signal
		})

	return await getBestMove({ fen, maxTime: 100, signal })
}

export const randomMove = (fen: string) => {
	const chessboard = new ChessGame(fen)
	const moves = getAllValidMoves(chessboard.getState())
	return moves[Math.floor(Math.random() * moves.length)]
}
