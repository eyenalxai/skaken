export type FenResult = {
	board: (string | null)[][] // 8x8 array representing the board, null for empty squares
	activeColor: "w" | "b"
	castling: {
		whiteKingSide: boolean
		whiteQueenSide: boolean
		blackKingSide: boolean
		blackQueenSide: boolean
	}
	enPassantTarget: string | null // Square in algebraic notation (e.g., 'e3') or null if no en passant
	halfmoveClock: number
	fullmoveNumber: number
}

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

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
	const board: (string | null)[][] = []
	const ranks = position.split("/")
	if (ranks.length !== 8) {
		throw new Error("Invalid FEN: board must have 8 ranks")
	}

	for (const rank of ranks) {
		const row: (string | null)[] = []
		for (let i = 0; i < rank.length; i++) {
			const char = rank[i]
			const emptySquares = Number.parseInt(char)
			if (Number.isNaN(emptySquares)) {
				row.push(char)
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
	const enPassantTarget = enPassant === "-" ? null : enPassant

	// Parse move numbers
	const halfmoveClock = Number.parseInt(halfmove)
	const fullmoveNumber = Number.parseInt(fullmove)

	if (Number.isNaN(halfmoveClock) || Number.isNaN(fullmoveNumber)) {
		throw new Error("Invalid FEN: move numbers must be integers")
	}

	return {
		board,
		activeColor: activeColor as "w" | "b",
		castling: castlingRights,
		enPassantTarget,
		halfmoveClock,
		fullmoveNumber
	}
}
