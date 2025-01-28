export type Color = "w" | "b"
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k"
export type Piece = `${Color}${PieceType}`
export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
export type Square = `${File}${Rank}`

export type FenResult = {
	board: (Piece | null)[][] // 8x8 array representing the board, null for empty squares
	activeColor: Color
	castling: {
		whiteKingSide: boolean
		whiteQueenSide: boolean
		blackKingSide: boolean
		blackQueenSide: boolean
	}
	enPassantTarget: Square | null // Square in algebraic notation (e.g., 'e3') or null if no en passant
	halfmoveClock: number
	fullmoveNumber: number
}

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

// Validation functions
function isPiece(char: string): char is Piece {
	const validPieces = ["p", "n", "b", "r", "q", "k"]
	const color = char === char.toUpperCase() ? "w" : "b"
	const pieceType = char.toLowerCase() as PieceType
	return (
		validPieces.includes(pieceType) &&
		((color === "w" && char === char.toUpperCase()) ||
			(color === "b" && char === char.toLowerCase()))
	)
}

function isSquare(square: string): square is Square {
	if (square.length !== 2) return false
	const [file, rank] = square.split("")
	return (
		["a", "b", "c", "d", "e", "f", "g", "h"].includes(file) &&
		["1", "2", "3", "4", "5", "6", "7", "8"].includes(rank)
	)
}

/**
 * Parses a FEN string into a structured object
 * @param fen - The FEN string to parse (defaults to initial position)
 * @returns Parsed FEN data
 * @throws Error if the FEN string is invalid
 */
export function parseFen(fen: string = INITIAL_FEN): FenResult {
	const parts = fen.split(" ")
	if (parts.length !== 6) {
		throw new Error("Invalid FEN: must contain 6 parts")
	}

	const [position, activeColor, castling, enPassant, halfmove, fullmove] = parts

	// Parse board position
	const board: (Piece | null)[][] = []
	const ranks = position.split("/")
	if (ranks.length !== 8) {
		throw new Error("Invalid FEN: board must have 8 ranks")
	}

	for (const rank of ranks) {
		const row: (Piece | null)[] = []
		for (let i = 0; i < rank.length; i++) {
			const char = rank[i]
			const emptySquares = Number.parseInt(char)
			if (Number.isNaN(emptySquares)) {
				if (!isPiece(char)) {
					throw new Error(`Invalid FEN: invalid piece character '${char}'`)
				}
				row.push(char as Piece)
			} else {
				for (let j = 0; j < emptySquares; j++) {
					row.push(null)
				}
			}
		}
		if (row.length !== 8) {
			throw new Error("Invalid FEN: each rank must have 8 squares")
		}
		board.push(row)
	}

	// Validate active color
	if (activeColor !== "w" && activeColor !== "b") {
		throw new Error('Invalid FEN: active color must be "w" or "b"')
	}

	// Parse castling rights
	const castlingRights = {
		whiteKingSide: castling.includes("K"),
		whiteQueenSide: castling.includes("Q"),
		blackKingSide: castling.includes("k"),
		blackQueenSide: castling.includes("q")
	}

	// Parse en passant target
	if (enPassant !== "-" && !isSquare(enPassant)) {
		throw new Error(`Invalid FEN: invalid en passant square '${enPassant}'`)
	}
	const enPassantTarget = enPassant === "-" ? null : (enPassant as Square)

	// Parse move numbers
	const halfmoveClock = Number.parseInt(halfmove)
	const fullmoveNumber = Number.parseInt(fullmove)

	if (Number.isNaN(halfmoveClock) || Number.isNaN(fullmoveNumber)) {
		throw new Error("Invalid FEN: move numbers must be integers")
	}

	if (halfmoveClock < 0 || fullmoveNumber < 1) {
		throw new Error("Invalid FEN: move numbers must be non-negative")
	}

	return {
		board,
		activeColor: activeColor as Color,
		castling: castlingRights,
		enPassantTarget,
		halfmoveClock,
		fullmoveNumber
	}
}
