import { ChessGame } from "@/lib/chess/game"
import {
	getAllCaptureMoves,
	getAllNonCaptureMoves,
	getAllValidMoves
} from "@/lib/chess/moves"
import {
	getBestMove,
	getBestMoveFromList
} from "@/lib/chess/strategy/stockfish"

export const berserkMove = async (fen: string, signal: AbortSignal) => {
	const chessboard = new ChessGame(fen)
	const state = chessboard.getState()

	const captureMoves = getAllCaptureMoves(state)

	if (captureMoves.length === 1) {
		const move = captureMoves[0]
		return `${move.from}${move.to}${move.promotion || ""}`
	}

	if (captureMoves.length > 1) {
		const uciMoves = captureMoves.map(
			(move) => `${move.from}${move.to}${move.promotion || ""}`
		)
		return await getBestMoveFromList({
			fen,
			moves: uciMoves,
			signal
		})
	}

	return await getBestMove(fen, 100, signal)
}

export const pacifistMove = async (fen: string, signal: AbortSignal) => {
	const chessboard = new ChessGame(fen)
	const state = chessboard.getState()

	const nonCaptureMoves = getAllNonCaptureMoves(state)

	if (nonCaptureMoves.length === 1) {
		const move = nonCaptureMoves[0]
		return `${move.from}${move.to}${move.promotion || ""}`
	}

	if (nonCaptureMoves.length > 1) {
		const uciMoves = nonCaptureMoves.map(
			(move) => `${move.from}${move.to}${move.promotion || ""}`
		)
		return await getBestMoveFromList({
			fen,
			moves: uciMoves,
			signal
		})
	}

	return await getBestMove(fen, 100, signal)
}

export const randomMove = (fen: string) => {
	const chessboard = new ChessGame(fen)
	const moves = getAllValidMoves(chessboard.getState())
	return moves[Math.floor(Math.random() * moves.length)]
}
