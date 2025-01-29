import { coordsToSquare, getValidMoves } from "@/lib/chess/moves"
import type { Color, GameState, Piece } from "@/lib/chess/state"

// Piece values in centipawns (1 pawn = 100)
const PIECE_VALUES: Record<string, number> = {
	p: 100,
	n: 320,
	b: 330,
	r: 500,
	q: 900,
	k: 20000
}

// Piece-square tables for positional evaluation
// Values are in centipawns and from white's perspective
const PAWN_TABLE = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[50, 50, 50, 50, 50, 50, 50, 50],
	[10, 10, 20, 30, 30, 20, 10, 10],
	[5, 5, 10, 25, 25, 10, 5, 5],
	[0, 0, 0, 20, 20, 0, 0, 0],
	[5, -5, -10, 0, 0, -10, -5, 5],
	[5, 10, 10, -20, -20, 10, 10, 5],
	[0, 0, 0, 0, 0, 0, 0, 0]
]

const KNIGHT_TABLE = [
	[-50, -40, -30, -30, -30, -30, -40, -50],
	[-40, -20, 0, 0, 0, 0, -20, -40],
	[-30, 0, 10, 15, 15, 10, 0, -30],
	[-30, 5, 15, 20, 20, 15, 5, -30],
	[-30, 0, 15, 20, 20, 15, 0, -30],
	[-30, 5, 10, 15, 15, 10, 5, -30],
	[-40, -20, 0, 5, 5, 0, -20, -40],
	[-50, -40, -30, -30, -30, -30, -40, -50]
]

const BISHOP_TABLE = [
	[-20, -10, -10, -10, -10, -10, -10, -20],
	[-10, 0, 0, 0, 0, 0, 0, -10],
	[-10, 0, 5, 10, 10, 5, 0, -10],
	[-10, 5, 5, 10, 10, 5, 5, -10],
	[-10, 0, 10, 10, 10, 10, 0, -10],
	[-10, 10, 10, 10, 10, 10, 10, -10],
	[-10, 5, 0, 0, 0, 0, 5, -10],
	[-20, -10, -10, -10, -10, -10, -10, -20]
]

const ROOK_TABLE = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[5, 10, 10, 10, 10, 10, 10, 5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[0, 0, 0, 5, 5, 0, 0, 0]
]

const QUEEN_TABLE = [
	[-20, -10, -10, -5, -5, -10, -10, -20],
	[-10, 0, 0, 0, 0, 0, 0, -10],
	[-10, 0, 5, 5, 5, 5, 0, -10],
	[-5, 0, 5, 5, 5, 5, 0, -5],
	[0, 0, 5, 5, 5, 5, 0, -5],
	[-10, 5, 5, 5, 5, 5, 0, -10],
	[-10, 0, 5, 0, 0, 0, 0, -10],
	[-20, -10, -10, -5, -5, -10, -10, -20]
]

const KING_MIDDLE_GAME_TABLE = [
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-20, -30, -30, -40, -40, -30, -30, -20],
	[-10, -20, -20, -20, -20, -20, -20, -10],
	[20, 20, 0, 0, 0, 0, 20, 20],
	[20, 30, 10, 0, 0, 10, 30, 20]
]

const KING_END_GAME_TABLE = [
	[-50, -40, -30, -20, -20, -30, -40, -50],
	[-30, -20, -10, 0, 0, -10, -20, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -30, 0, 0, 0, 0, -30, -30],
	[-50, -30, -30, -30, -30, -30, -30, -50]
]

const PIECE_SQUARE_TABLES: Record<string, number[][]> = {
	p: PAWN_TABLE,
	n: KNIGHT_TABLE,
	b: BISHOP_TABLE,
	r: ROOK_TABLE,
	q: QUEEN_TABLE,
	k: KING_MIDDLE_GAME_TABLE
}

// Helper function to determine if we're in endgame
const isEndgame = (state: GameState): boolean => {
	let pieceValue = 0
	for (let rank = 0; rank < state.boardSize; rank++) {
		for (let file = 0; file < state.boardSize; file++) {
			const piece = state.board[rank][file]
			if (!piece || piece[1] === "k") continue
			pieceValue += PIECE_VALUES[piece[1]]
		}
	}
	return pieceValue <= 1500 // Roughly queen + rook
}

// Get positional score for a piece
const getPositionalScore = (
	piece: Piece,
	rank: number,
	file: number,
	state: GameState
): number => {
	const pieceType = piece[1]
	const color = piece[0]
	const table =
		pieceType === "k" && isEndgame(state)
			? KING_END_GAME_TABLE
			: PIECE_SQUARE_TABLES[pieceType]

	if (!table) return 0

	// For black pieces, we flip the rank index
	const rankIndex = color === "w" ? rank : state.boardSize - 1 - rank
	// Scale the table values based on board size
	const scaledRank = Math.floor((rankIndex * 8) / state.boardSize)
	const scaledFile = Math.floor((file * 8) / state.boardSize)

	return table[scaledRank][scaledFile]
}

// Evaluate mobility (number of legal moves)
const evaluateMobility = (state: GameState, color: Color): number => {
	let mobility = 0
	for (let rank = 0; rank < state.boardSize; rank++) {
		for (let file = 0; file < state.boardSize; file++) {
			const piece = state.board[rank][file]
			if (!piece || piece[0] !== color) continue

			const square = coordsToSquare(rank, file, state.boardSize)
			const moves = getValidMoves({ ...state, activeColor: color }, square)
			mobility += moves.length
		}
	}
	return mobility
}

// Main evaluation function
export const evaluate = (state: GameState): number => {
	let score = 0

	// Material and positional evaluation
	for (let rank = 0; rank < state.boardSize; rank++) {
		for (let file = 0; file < state.boardSize; file++) {
			const piece = state.board[rank][file]
			if (!piece) continue

			const pieceValue = PIECE_VALUES[piece[1]]
			const positionalValue = getPositionalScore(piece, rank, file, state)

			if (piece[0] === "w") {
				score += pieceValue + positionalValue
			} else {
				score -= pieceValue + positionalValue
			}
		}
	}

	// Mobility evaluation (weighted less than material)
	const mobilityWeight = 0.1
	score +=
		mobilityWeight *
		(evaluateMobility(state, "w") - evaluateMobility(state, "b"))

	// Return the score from white's perspective
	return score
}
