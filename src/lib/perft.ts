import { type GameState, type Square, toFen } from "@/lib/chess"
import { ChessGame } from "@/lib/game"
import {
	type Move,
	coordsToSquare,
	getValidMoves,
	isSquareUnderAttack,
	squareToCoords
} from "@/lib/moves"

export type PerftResult = {
	nodes: number
	captures: number
	enPassant: number
	castles: number
	promotions: number
	checks: number
	discoveryChecks: number
	doubleChecks: number
	checkmates: number
}

const isCapture = (state: GameState, move: Move): boolean => {
	const [toRank, toFile] = squareToCoords(move.to)
	// Only count regular captures, not en passant (which is counted separately)
	return state.board[toRank][toFile] !== null
}

const isCastle = (state: GameState, move: Move) => {
	const [fromRank, fromFile] = squareToCoords(move.from)
	const piece = state.board[fromRank][fromFile]
	if (!piece || piece[1] !== "k") return false

	return Math.abs(fromFile - squareToCoords(move.to)[1]) === 2
}

const isEnPassant = (state: GameState, move: Move) =>
	move.to === state.enPassantTarget

const isPromotion = (move: Move) => move.promotion !== undefined

const isDiscoveryCheck = (state: GameState, move: Move) => {
	const [fromRank, fromFile] = squareToCoords(move.from)
	const movingPiece = state.board[fromRank][fromFile]
	if (!movingPiece) return false

	// Create a temporary state with the piece removed
	const tempState: GameState = {
		...state,
		board: state.board.map((rank) => [...rank])
	}
	tempState.board[fromRank][fromFile] = null

	// Find the opponent's king
	let kingSquare: Square | null = null
	const opponentColor = state.activeColor === "w" ? "b" : "w"

	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const piece = state.board[rank][file]
			if (piece && piece[0] === opponentColor && piece[1] === "k") {
				kingSquare = coordsToSquare(rank, file)
				break
			}
		}
		if (kingSquare) break
	}

	if (!kingSquare) return false

	// Check if removing the piece reveals a check
	return isSquareUnderAttack(tempState, kingSquare, opponentColor)
}

const isDoubleCheck = (game: ChessGame, move: Move) => {
	const [fromRank, fromFile] = squareToCoords(move.from)
	const movingPiece = game.getState().board[fromRank][fromFile]
	if (!movingPiece) return false

	// Make the move
	const tempGame = new ChessGame(toFen(game.getState()))
	if (!tempGame.makeMove(move)) return false

	// Count how many pieces are giving check
	let checkCount = 0
	const opponentColor = game.getState().activeColor === "w" ? "b" : "w"

	// Find the opponent's king after the move
	let kingSquare: Square | null = null
	const newState = tempGame.getState()

	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const piece = newState.board[rank][file]
			if (piece && piece[0] === opponentColor && piece[1] === "k") {
				kingSquare = coordsToSquare(rank, file)
				break
			}
		}
		if (kingSquare) break
	}

	if (!kingSquare) return false

	// Count attacking pieces
	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const piece = newState.board[rank][file]
			if (!piece || piece[0] !== game.getState().activeColor) continue

			const square = coordsToSquare(rank, file)
			const moves = getValidMoves(newState, square)

			if (moves.some((m) => m.to === kingSquare)) {
				checkCount++
				if (checkCount > 1) return true
			}
		}
	}

	return false
}

export const perft = (state: GameState, depth: number) => {
	if (depth === 0) {
		return {
			nodes: 1,
			captures: 0,
			enPassant: 0,
			castles: 0,
			promotions: 0,
			checks: 0,
			discoveryChecks: 0,
			doubleChecks: 0,
			checkmates: 0
		} satisfies PerftResult
	}

	const result = {
		nodes: 0,
		captures: 0,
		enPassant: 0,
		castles: 0,
		promotions: 0,
		checks: 0,
		discoveryChecks: 0,
		doubleChecks: 0,
		checkmates: 0
	} satisfies PerftResult

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
					const isCheck = status === "check" || status === "checkmate"

					if (isCheck) {
						result.checks++
						if (isDiscoveryCheck(state, move)) {
							result.discoveryChecks++
						}
						if (isDoubleCheck(game, move)) {
							result.doubleChecks++
						}
					}

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
					result.discoveryChecks += subPerft.discoveryChecks
					result.doubleChecks += subPerft.doubleChecks
					result.checkmates += subPerft.checkmates
				}
			}
		}
	}

	return result satisfies PerftResult
}
