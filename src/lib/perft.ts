import { type GameState, type Square, toFen } from "@/lib/chess"
import { ChessGame } from "@/lib/game"
import { type Move, getValidMoves, squareToCoords } from "@/lib/moves"

export type PerftResult = {
	nodes: number
	captures: number
	enPassant: number
	castles: number
	promotions: number
	checks: number
	checkmates: number
}

const isCapture = (state: GameState, move: Move): boolean => {
	const [toRank, toFile] = squareToCoords(move.to)
	return (
		state.board[toRank][toFile] !== null || state.enPassantTarget === move.to
	)
}

const isCastle = (state: GameState, move: Move): boolean => {
	const [fromRank, fromFile] = squareToCoords(move.from)
	const piece = state.board[fromRank][fromFile]
	if (!piece || piece[1] !== "k") return false

	return Math.abs(fromFile - squareToCoords(move.to)[1]) === 2
}

const isEnPassant = (state: GameState, move: Move): boolean => {
	return move.to === state.enPassantTarget
}

const isPromotion = (move: Move): boolean => {
	return move.promotion !== undefined
}

export const perft = (state: GameState, depth: number): PerftResult => {
	if (depth === 0) {
		return {
			nodes: 1,
			captures: 0,
			enPassant: 0,
			castles: 0,
			promotions: 0,
			checks: 0,
			checkmates: 0
		}
	}

	const result: PerftResult = {
		nodes: 0,
		captures: 0,
		enPassant: 0,
		castles: 0,
		promotions: 0,
		checks: 0,
		checkmates: 0
	}

	// Get all pieces of the active color
	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const piece = state.board[rank][file]
			if (!piece || piece[0] !== state.activeColor) continue

			const square = (String.fromCharCode(file + 97) + (8 - rank)) as Square
			const moves = getValidMoves(state, square)

			for (const move of moves) {
				const game = new ChessGame(toFen(state))
				game.makeMove(move)

				if (depth === 1) {
					result.captures += isCapture(state, move) ? 1 : 0
					result.enPassant += isEnPassant(state, move) ? 1 : 0
					result.castles += isCastle(state, move) ? 1 : 0
					result.promotions += isPromotion(move) ? 1 : 0

					const status = game.getStatus()
					result.checks += status === "check" ? 1 : 0
					result.checkmates += status === "checkmate" ? 1 : 0
				}

				const subPerft = perft(game.getState(), depth - 1)

				result.nodes += subPerft.nodes
				if (depth > 1) {
					result.captures += subPerft.captures
					result.enPassant += subPerft.enPassant
					result.castles += subPerft.castles
					result.promotions += subPerft.promotions
					result.checks += subPerft.checks
					result.checkmates += subPerft.checkmates
				}
			}
		}
	}

	return result
}
