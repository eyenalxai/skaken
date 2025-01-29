import type { Color, GameState, Piece, Square } from "@/lib/chess"

export type Move = {
	from: Square
	to: Square
	promotion?: "q" | "r" | "b" | "n"
}

export type Position = {
	piece: Piece
	square: Square
}

const fileToIndex = (file: string) => file.charCodeAt(0) - "a".charCodeAt(0)

const rankToIndex = (rank: string) => 8 - Number.parseInt(rank)

const indexToFile = (index: number) =>
	String.fromCharCode(index + "a".charCodeAt(0))

const indexToRank = (index: number) => (8 - index).toString()

export const squareToCoords = (square: Square) => {
	const [file, rank] = square.split("")
	return [rankToIndex(rank), fileToIndex(file)]
}

export const coordsToSquare = (rank: number, file: number) => {
	return `${indexToFile(file)}${indexToRank(rank)}` as Square
}

export const isInBounds = (rank: number, file: number) => {
	return rank >= 0 && rank < 8 && file >= 0 && file < 8
}

export const getPieceAt = (board: GameState["board"], square: Square) => {
	const [rank, file] = squareToCoords(square)
	return board[rank][file]
}

export const getValidMoves = (state: GameState, square: Square) => {
	const piece = getPieceAt(state.board, square)
	if (!piece) return []

	const [color, type] = piece
	if (color !== state.activeColor) return []

	const moves: Move[] = []
	const [rank, file] = squareToCoords(square)

	switch (type) {
		case "p":
			moves.push(...getPawnMoves(state, rank, file, color))
			break
		case "n":
			moves.push(...getKnightMoves(state, rank, file, color))
			break
		case "b":
			moves.push(...getBishopMoves(state, rank, file, color))
			break
		case "r":
			moves.push(...getRookMoves(state, rank, file, color))
			break
		case "q":
			moves.push(...getQueenMoves(state, rank, file, color))
			break
		case "k":
			moves.push(...getKingMoves(state, rank, file, color))
			break
	}

	return moves.filter((move) => !movePutsKingInCheck(state, move))
}

const getPawnMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) => {
	const moves: Move[] = []
	const direction = color === "w" ? -1 : 1
	const startRank = color === "w" ? 6 : 1
	const promotionRank = color === "w" ? 0 : 7

	const newRank = rank + direction
	const forwardSquare = coordsToSquare(newRank, file)

	if (isInBounds(newRank, file) && !getPieceAt(state.board, forwardSquare)) {
		if (newRank === promotionRank) {
			for (const piece of ["q", "r", "b", "n"] as const) {
				moves.push({
					from: coordsToSquare(rank, file),
					to: forwardSquare,
					promotion: piece
				})
			}
		} else {
			moves.push({
				from: coordsToSquare(rank, file),
				to: forwardSquare
			})

			if (
				rank === startRank &&
				!getPieceAt(state.board, coordsToSquare(rank + direction * 2, file))
			) {
				moves.push({
					from: coordsToSquare(rank, file),
					to: coordsToSquare(rank + direction * 2, file)
				})
			}
		}
	}

	for (const captureFile of [file - 1, file + 1]) {
		if (!isInBounds(newRank, captureFile)) continue

		const targetSquare = coordsToSquare(newRank, captureFile)
		const targetPiece = getPieceAt(state.board, targetSquare)

		if (targetSquare === state.enPassantTarget) {
			const capturedPawnRank = rank // The captured pawn is on the same rank as the capturing pawn
			const capturedPawnFile = captureFile

			const capturedPawn = getPieceAt(
				state.board,
				coordsToSquare(capturedPawnRank, capturedPawnFile)
			)

			if (capturedPawn?.[1] === "p" && capturedPawn?.[0] !== color) {
				moves.push({
					from: coordsToSquare(rank, file),
					to: targetSquare
				})
			}
		} else if (targetPiece && targetPiece[0] !== color) {
			if (newRank === promotionRank) {
				for (const piece of ["q", "r", "b", "n"] as const) {
					moves.push({
						from: coordsToSquare(rank, file),
						to: targetSquare,
						promotion: piece
					})
				}
			} else {
				moves.push({
					from: coordsToSquare(rank, file),
					to: targetSquare
				})
			}
		}
	}

	return moves
}

const KNIGHT_MOVES: [number, number][] = [
	[-2, -1],
	[-2, 1],
	[-1, -2],
	[-1, 2],
	[1, -2],
	[1, 2],
	[2, -1],
	[2, 1]
]

const getKnightMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) => {
	const moves: Move[] = []

	for (const [dRank, dFile] of KNIGHT_MOVES) {
		const newRank = rank + dRank
		const newFile = file + dFile

		if (!isInBounds(newRank, newFile)) continue

		const targetSquare = coordsToSquare(newRank, newFile)
		const targetPiece = getPieceAt(state.board, targetSquare)

		if (!targetPiece || targetPiece[0] !== color) {
			moves.push({
				from: coordsToSquare(rank, file),
				to: targetSquare
			})
		}
	}

	return moves
}

const getSlidingMoves = (
	state: GameState,
	rank: number,
	file: number,
	directions: [number, number][],
	color: Color
) => {
	const moves: Move[] = []

	for (const [dRank, dFile] of directions) {
		let newRank = rank + dRank
		let newFile = file + dFile

		while (isInBounds(newRank, newFile)) {
			const targetSquare = coordsToSquare(newRank, newFile)
			const targetPiece = getPieceAt(state.board, targetSquare)

			if (!targetPiece) {
				moves.push({
					from: coordsToSquare(rank, file),
					to: targetSquare
				})
			} else {
				if (targetPiece[0] !== color) {
					moves.push({
						from: coordsToSquare(rank, file),
						to: targetSquare
					})
				}
				break
			}

			newRank += dRank
			newFile += dFile
		}
	}

	return moves
}

const BISHOP_DIRECTIONS: [number, number][] = [
	[-1, -1],
	[-1, 1],
	[1, -1],
	[1, 1]
]

const getBishopMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) => getSlidingMoves(state, rank, file, BISHOP_DIRECTIONS, color)

const ROOK_DIRECTIONS: [number, number][] = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1]
]

const getRookMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) => getSlidingMoves(state, rank, file, ROOK_DIRECTIONS, color)

const getQueenMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color
) =>
	getSlidingMoves(
		state,
		rank,
		file,
		[...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS],
		color
	)

const KING_MOVES: [number, number][] = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1]
]

const getKingMoves = (
	state: GameState,
	rank: number,
	file: number,
	color: Color,
	includeCastling = true
) => {
	const moves: Move[] = []

	for (const [dRank, dFile] of KING_MOVES) {
		const newRank = rank + dRank
		const newFile = file + dFile

		if (!isInBounds(newRank, newFile)) continue

		const targetSquare = coordsToSquare(newRank, newFile)
		const targetPiece = getPieceAt(state.board, targetSquare)

		if (!targetPiece || targetPiece[0] !== color) {
			moves.push({
				from: coordsToSquare(rank, file),
				to: targetSquare
			})
		}
	}

	if (!includeCastling) return moves

	if (color === "w") {
		if (state.castling.whiteKingSide && canCastleKingSide(state, "w")) {
			moves.push({
				from: "e1",
				to: "g1"
			})
		}
		if (state.castling.whiteQueenSide && canCastleQueenSide(state, "w")) {
			moves.push({
				from: "e1",
				to: "c1"
			})
		}
	} else {
		if (state.castling.blackKingSide && canCastleKingSide(state, "b")) {
			moves.push({
				from: "e8",
				to: "g8"
			})
		}
		if (state.castling.blackQueenSide && canCastleQueenSide(state, "b")) {
			moves.push({
				from: "e8",
				to: "c8"
			})
		}
	}

	return moves
}

const canCastleKingSide = (state: GameState, color: Color) => {
	const squares = color === "w" ? ["f1", "g1"] : ["f8", "g8"]
	const kingSquare = color === "w" ? "e1" : "e8"
	const rookSquare = color === "w" ? "h1" : "h8"

	if (!getPieceAt(state.board, rookSquare as Square)?.startsWith(`${color}r`)) {
		return false
	}

	return (
		squares.every((square) => !getPieceAt(state.board, square as Square)) &&
		!isSquareUnderAttack(state, kingSquare as Square, color) &&
		squares.every(
			(square) => !isSquareUnderAttack(state, square as Square, color)
		)
	)
}

const canCastleQueenSide = (state: GameState, color: Color) => {
	const squares = color === "w" ? ["d1", "c1", "b1"] : ["d8", "c8", "b8"]
	const kingSquare = color === "w" ? "e1" : "e8"
	const checkSquares = color === "w" ? ["d1", "c1"] : ["d8", "c8"]
	const rookSquare = color === "w" ? "a1" : "a8"

	if (!getPieceAt(state.board, rookSquare as Square)?.startsWith(`${color}r`)) {
		return false
	}

	return (
		squares.every((square) => !getPieceAt(state.board, square as Square)) &&
		!isSquareUnderAttack(state, kingSquare as Square, color) &&
		checkSquares.every(
			(square) => !isSquareUnderAttack(state, square as Square, color)
		)
	)
}

export const isSquareUnderAttack = (
	state: GameState,
	square: Square,
	defendingColor: Color
) => {
	const tempState: GameState = {
		...state,
		activeColor: defendingColor === "w" ? "b" : "w"
	}

	for (let rank = 0; rank < 8; rank++) {
		for (let file = 0; file < 8; file++) {
			const piece = tempState.board[rank][file]
			if (!piece || piece[0] === defendingColor) continue

			const moves = getRawMovesForPiece(
				tempState,
				rank,
				file,
				piece[0] as Color,
				false // Don't include castling moves when checking for attacks
			)

			if (moves.some((m) => m.to === square)) {
				return true
			}
		}
	}
	return false
}

export const getRawMovesForPiece = (
	state: GameState,
	rank: number,
	file: number,
	color: Color,
	includeCastling = true
) => {
	const piece = state.board[rank][file]
	if (!piece) return []

	switch (piece[1]) {
		case "p":
			return getPawnMoves(state, rank, file, color)
		case "n":
			return getKnightMoves(state, rank, file, color)
		case "b":
			return getBishopMoves(state, rank, file, color)
		case "r":
			return getRookMoves(state, rank, file, color)
		case "q":
			return getQueenMoves(state, rank, file, color)
		case "k":
			return getKingMoves(state, rank, file, color, includeCastling)
		default:
			return []
	}
}

const movePutsKingInCheck = (state: GameState, move: Move) => {
	const newBoard = state.board.map((rank) => [...rank])
	const [fromRank, fromFile] = squareToCoords(move.from)
	const [toRank, toFile] = squareToCoords(move.to)
	const movingPiece = newBoard[fromRank][fromFile]

	if (
		movingPiece &&
		movingPiece[1] === "p" &&
		move.to === state.enPassantTarget
	) {
		const capturedPawnRank = fromRank
		const capturedPawnFile = toFile
		newBoard[capturedPawnRank][capturedPawnFile] = null
	}

	newBoard[toRank][toFile] = newBoard[fromRank][fromFile]
	newBoard[fromRank][fromFile] = null

	if (move.promotion) {
		newBoard[toRank][toFile] = `${state.activeColor}${move.promotion}` as Piece
	}

	let kingSquare: Square | null = null

	if (movingPiece && movingPiece[1] === "k") {
		kingSquare = move.to
	} else {
		for (let rank = 0; rank < 8; rank++) {
			for (let file = 0; file < 8; file++) {
				const piece = newBoard[rank][file]
				if (piece && piece[0] === state.activeColor && piece[1] === "k") {
					kingSquare = coordsToSquare(rank, file)
					break
				}
			}
			if (kingSquare) break
		}
	}

	if (!kingSquare) return true

	const newState: GameState = {
		...state,
		board: newBoard,
		activeColor: state.activeColor === "w" ? "b" : "w"
	}

	return isSquareUnderAttack(newState, kingSquare, state.activeColor)
}
