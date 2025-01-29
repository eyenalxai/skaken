import { evaluate } from "@/lib/chess/eval"
import { ChessGame } from "@/lib/chess/game"
import type { Move } from "@/lib/chess/moves"
import type { Square } from "@/lib/chess/state"

export interface ChessStrategy {
	getMove(game: ChessGame): Move | null
}

// Strategy that picks a random valid move
export class RandomStrategy implements ChessStrategy {
	getMove(game: ChessGame): Move | null {
		const state = game.getState()
		const allMoves: Move[] = []

		// Collect all valid moves for the current player
		for (let rank = 0; rank < state.boardSize; rank++) {
			for (let file = 0; file < state.boardSize; file++) {
				const piece = state.board[rank][file]
				if (!piece || piece[0] !== state.activeColor) continue

				const square = (String.fromCharCode(97 + file) +
					(state.boardSize - rank)) as Square
				const moves = game.getValidMoves(square)
				allMoves.push(...moves)
			}
		}

		if (allMoves.length === 0) return null

		// Pick a random move
		const randomIndex = Math.floor(Math.random() * allMoves.length)
		return allMoves[randomIndex]
	}
}

// Strategy that only makes capture moves, or random moves if no captures available
export class CaptureOnlyStrategy implements ChessStrategy {
	getMove(game: ChessGame): Move | null {
		const state = game.getState()
		const captureMoves: Move[] = []
		const nonCaptureMoves: Move[] = []

		// Collect all valid moves, separating captures from non-captures
		for (let rank = 0; rank < state.boardSize; rank++) {
			for (let file = 0; file < state.boardSize; file++) {
				const piece = state.board[rank][file]
				if (!piece || piece[0] !== state.activeColor) continue

				const square = (String.fromCharCode(97 + file) +
					(state.boardSize - rank)) as Square
				const moves = game.getValidMoves(square)

				for (const move of moves) {
					const [file, rank] = move.to.match(/[a-z]|\d+/g) as [string, string]
					const targetSquare =
						state.board[state.boardSize - Number.parseInt(rank)][
							file.charCodeAt(0) - 97
						]

					if (targetSquare !== null) {
						captureMoves.push(move)
					} else {
						nonCaptureMoves.push(move)
					}
				}
			}
		}

		if (captureMoves.length > 0) {
			const randomIndex = Math.floor(Math.random() * captureMoves.length)
			return captureMoves[randomIndex]
		}

		if (nonCaptureMoves.length > 0) {
			const randomIndex = Math.floor(Math.random() * nonCaptureMoves.length)
			return nonCaptureMoves[randomIndex]
		}

		return null
	}
}

// Strategy that looks ahead a few moves and picks the best one based on evaluation
export class MinimaxStrategy implements ChessStrategy {
	private readonly depth: number

	constructor(depth = 2) {
		this.depth = depth
	}

	getMove(game: ChessGame): Move | null {
		const state = game.getState()
		let bestMove: Move | null = null
		let bestScore =
			state.activeColor === "w"
				? Number.NEGATIVE_INFINITY
				: Number.POSITIVE_INFINITY

		// Get all valid moves for the current position
		const allMoves: Move[] = []
		for (let rank = 0; rank < state.boardSize; rank++) {
			for (let file = 0; file < state.boardSize; file++) {
				const piece = state.board[rank][file]
				if (!piece || piece[0] !== state.activeColor) continue

				const square = (String.fromCharCode(97 + file) +
					(state.boardSize - rank)) as Square
				const moves = game.getValidMoves(square)
				allMoves.push(...moves)
			}
		}

		// Evaluate each move
		for (const move of allMoves) {
			const newGame = new ChessGame(game.getFen(), state.boardSize)
			newGame.makeMove(move)

			const score = this.minimax(
				newGame,
				this.depth - 1,
				Number.NEGATIVE_INFINITY,
				Number.POSITIVE_INFINITY,
				state.activeColor !== "w"
			)

			if (state.activeColor === "w") {
				if (score > bestScore) {
					bestScore = score
					bestMove = move
				}
			} else {
				if (score < bestScore) {
					bestScore = score
					bestMove = move
				}
			}
		}

		return bestMove
	}

	private minimax(
		game: ChessGame,
		depth: number,
		alpha: number,
		beta: number,
		maximizingPlayer: boolean
	): number {
		if (depth === 0) {
			return evaluate(game.getState())
		}

		const state = game.getState()
		const allMoves: Move[] = []

		// Get all valid moves
		for (let rank = 0; rank < state.boardSize; rank++) {
			for (let file = 0; file < state.boardSize; file++) {
				const piece = state.board[rank][file]
				if (!piece || piece[0] !== state.activeColor) continue

				const square = (String.fromCharCode(97 + file) +
					(state.boardSize - rank)) as Square
				const moves = game.getValidMoves(square)
				allMoves.push(...moves)
			}
		}

		if (allMoves.length === 0) {
			// Game is over
			const status = game.getStatus()
			if (status === "checkmate") {
				return maximizingPlayer ? -20000 : 20000
			}
			return 0 // Draw
		}

		if (maximizingPlayer) {
			let bestEval = Number.NEGATIVE_INFINITY
			let currentAlpha = alpha
			for (const move of allMoves) {
				const newGame = new ChessGame(game.getFen(), state.boardSize)
				newGame.makeMove(move)
				const score = this.minimax(
					newGame,
					depth - 1,
					currentAlpha,
					beta,
					false
				)
				bestEval = Math.max(bestEval, score)
				currentAlpha = Math.max(currentAlpha, score)
				if (beta <= currentAlpha) break
			}
			return bestEval
		}

		let bestEval = Number.POSITIVE_INFINITY
		let currentBeta = beta
		for (const move of allMoves) {
			const newGame = new ChessGame(game.getFen(), state.boardSize)
			newGame.makeMove(move)
			const score = this.minimax(newGame, depth - 1, alpha, currentBeta, true)
			bestEval = Math.min(bestEval, score)
			currentBeta = Math.min(currentBeta, score)
			if (currentBeta <= alpha) break
		}
		return bestEval
	}
}
