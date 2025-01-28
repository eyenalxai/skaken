import type { FenResult, Piece, Square } from "@/lib/chess"
import { parseFen } from "@/lib/chess"
import { INITIAL_FEN } from "@/lib/chess"
import { charToPiece, isPiece, isSquare } from "@/lib/chess"
import { toFen } from "@/lib/chess"
import { describe, expect, test } from "vitest"

describe("parseFen", () => {
	test("should parse initial position correctly", () => {
		const result = parseFen(INITIAL_FEN)

		// Check board structure
		expect(result.board.length).toBe(8)
		for (const rank of result.board) {
			expect(rank.length).toBe(8)
		}

		// Check first rank (white pieces)
		expect(result.board[7]).toEqual<(Piece | null)[]>([
			"wr",
			"wn",
			"wb",
			"wq",
			"wk",
			"wb",
			"wn",
			"wr"
		])

		// Check second rank (white pawns)
		expect(result.board[6]).toEqual<(Piece | null)[]>([
			"wp",
			"wp",
			"wp",
			"wp",
			"wp",
			"wp",
			"wp",
			"wp"
		])

		// Check empty ranks
		for (let i = 2; i < 6; i++) {
			expect(result.board[i]).toEqual<(Piece | null)[]>([
				null,
				null,
				null,
				null,
				null,
				null,
				null,
				null
			])
		}

		// Check seventh rank (black pawns)
		expect(result.board[1]).toEqual<(Piece | null)[]>([
			"bp",
			"bp",
			"bp",
			"bp",
			"bp",
			"bp",
			"bp",
			"bp"
		])

		// Check eighth rank (black pieces)
		expect(result.board[0]).toEqual<(Piece | null)[]>([
			"br",
			"bn",
			"bb",
			"bq",
			"bk",
			"bb",
			"bn",
			"br"
		])

		// Check other FEN components
		expect(result.activeColor).toBe("w")
		expect(result.castling).toEqual({
			whiteKingSide: true,
			whiteQueenSide: true,
			blackKingSide: true,
			blackQueenSide: true
		})
		expect(result.enPassantTarget).toBeNull()
		expect(result.halfmoveClock).toBe(0)
		expect(result.fullmoveNumber).toBe(1)
	})

	test("should parse a mid-game position correctly", () => {
		const midGameFen =
			"rnbqkb1r/pp2pppp/2p2n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 5"
		const result = parseFen(midGameFen)

		expect(result.activeColor).toBe("w")
		expect(result.castling).toEqual({
			whiteKingSide: true,
			whiteQueenSide: true,
			blackKingSide: true,
			blackQueenSide: true
		})
		expect(result.enPassantTarget).toBeNull()
		expect(result.halfmoveClock).toBe(0)
		expect(result.fullmoveNumber).toBe(5)
	})

	test("should parse a position with en passant target", () => {
		const enPassantFen =
			"rnbqkbnr/ppp2ppp/8/3p4/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq e3 0 3"
		const result = parseFen(enPassantFen)

		expect(result.enPassantTarget).toBe("e3" as Square)
	})

	test("should throw error for invalid FEN string format", () => {
		const invalidFens = [
			"too/few/ranks/4/5/6 w KQkq - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq", // missing parts
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1", // invalid active color
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkqZ - 0 1", // invalid castling rights
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e9 0 1" // invalid en passant square
		]

		for (const fen of invalidFens) {
			expect(() => parseFen(fen)).toThrow()
		}
	})

	test("should throw error for invalid piece placement", () => {
		const invalidFens = [
			"rnbqkbnr/pppppppp/9/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // invalid empty squares number
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNX w KQkq - 0 1" // invalid piece character
		]

		for (const fen of invalidFens) {
			expect(() => parseFen(fen)).toThrow()
		}
	})

	test("should handle different castling rights combinations", () => {
		const testCases: Array<[string, FenResult["castling"]]> = [
			[
				"-",
				{
					whiteKingSide: false,
					whiteQueenSide: false,
					blackKingSide: false,
					blackQueenSide: false
				}
			],
			[
				"K",
				{
					whiteKingSide: true,
					whiteQueenSide: false,
					blackKingSide: false,
					blackQueenSide: false
				}
			],
			[
				"Qk",
				{
					whiteKingSide: false,
					whiteQueenSide: true,
					blackKingSide: true,
					blackQueenSide: false
				}
			],
			[
				"KQkq",
				{
					whiteKingSide: true,
					whiteQueenSide: true,
					blackKingSide: true,
					blackQueenSide: true
				}
			]
		]

		for (const [castlingStr, expected] of testCases) {
			const fen = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w ${castlingStr} - 0 1`
			const result = parseFen(fen)
			expect(result.castling).toEqual(expected)
		}
	})

	test("should validate move clock numbers", () => {
		// Valid move clocks
		expect(() =>
			parseFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 50 1")
		).not.toThrow()
		expect(() =>
			parseFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 999")
		).not.toThrow()

		// Invalid move clocks
		expect(() =>
			parseFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1")
		).toThrow()
		expect(() =>
			parseFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0")
		).toThrow()
		expect(() =>
			parseFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0.5 1")
		).toThrow()
	})

	test("should parse complex board positions correctly", () => {
		// Position with multiple empty squares and mixed pieces
		const complexFen =
			"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
		const result = parseFen(complexFen)

		// Black pieces on top ranks (index 0)
		expect(result.board[0][0]).toBe("br")
		expect(result.board[0][4]).toBe("bk")
		expect(result.board[0][7]).toBe("br")
		expect(result.board[1][0]).toBe("bp")
		expect(result.board[1][2]).toBe("bp")
		expect(result.board[1][6]).toBe("bb")
		expect(result.board[2][0]).toBe("bb")
		expect(result.board[2][1]).toBe("bn")

		// Check some empty squares
		expect(result.board[0][1]).toBeNull()
		expect(result.board[0][2]).toBeNull()

		// Check some white pieces on bottom ranks (index 7)
		expect(result.board[7][0]).toBe("wr")
		expect(result.board[7][4]).toBe("wk")
		expect(result.board[7][7]).toBe("wr")
	})

	test("should handle edge cases in piece placement", () => {
		// All empty squares
		expect(() => parseFen("8/8/8/8/8/8/8/8 w - - 0 1")).not.toThrow()

		// All white pieces
		expect(() =>
			parseFen("RNBQKBNR/PPPPPPPP/8/8/8/8/8/8 w - - 0 1")
		).not.toThrow()

		// All black pieces
		expect(() =>
			parseFen("8/8/8/8/8/8/pppppppp/rnbqkbnr b - - 0 1")
		).not.toThrow()

		// Maximum consecutive empty squares
		expect(() => parseFen("8/8/8/8/3P4/8/8/8 w - - 0 1")).not.toThrow()
	})

	test("should reject invalid piece arrangements", () => {
		const invalidPositions = [
			// Too many squares in a rank (9 pieces)
			"rnbqkbnrr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			// Too few squares in a rank (7 pieces)
			"rnbqkbn/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			// Invalid piece character
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBXR w KQkq - 0 1"
		]

		for (const fen of invalidPositions) {
			expect(() => parseFen(fen)).toThrow()
		}
	})

	test("should validate en passant target squares", () => {
		// Valid en passant squares
		expect(() =>
			parseFen("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1")
		).not.toThrow()
		expect(() =>
			parseFen("rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2")
		).not.toThrow()

		// Invalid en passant squares
		expect(() =>
			parseFen("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e4 0 1")
		).toThrow()
		expect(() =>
			parseFen("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e5 0 1")
		).toThrow()
	})
})

describe("isPiece", () => {
	test("should validate correct piece characters", () => {
		const validPieces = [
			"p",
			"n",
			"b",
			"r",
			"q",
			"k",
			"P",
			"N",
			"B",
			"R",
			"Q",
			"K"
		]
		for (const piece of validPieces) {
			expect(isPiece(piece)).toBe(true)
		}
	})

	test("should reject invalid piece characters", () => {
		const invalidPieces = ["x", "1", "", " ", "pP", "kk", "qq", "$"]
		for (const piece of invalidPieces) {
			expect(isPiece(piece)).toBe(false)
		}
	})
})

describe("isSquare", () => {
	test("should validate correct square notations", () => {
		const validSquares = ["a1", "e4", "h8", "b6", "g2"]
		for (const square of validSquares) {
			expect(isSquare(square)).toBe(true)
		}
	})

	test("should reject invalid square notations", () => {
		const invalidSquares = [
			"a0",
			"e9",
			"i4",
			"aa",
			"11",
			"a",
			"4",
			"",
			"a1b",
			"  "
		]
		for (const square of invalidSquares) {
			expect(isSquare(square)).toBe(false)
		}
	})
})

describe("charToPiece", () => {
	test("should convert valid piece characters", () => {
		const conversions = [
			["p", "bp"],
			["n", "bn"],
			["b", "bb"],
			["r", "br"],
			["q", "bq"],
			["k", "bk"],
			["P", "wp"],
			["N", "wn"],
			["B", "wb"],
			["R", "wr"],
			["Q", "wq"],
			["K", "wk"]
		]

		for (const [input, expected] of conversions) {
			expect(charToPiece(input)).toBe(expected)
		}
	})

	test("should throw error for invalid piece characters", () => {
		const invalidChars = ["x", "1", "", " ", "pP", "kk", "qq", "$"]
		for (const char of invalidChars) {
			expect(() => charToPiece(char)).toThrow("Invalid piece character")
		}
	})
})

describe("toFen", () => {
	test("should convert initial position correctly", () => {
		const state = parseFen(INITIAL_FEN)
		expect(toFen(state)).toBe(INITIAL_FEN)
	})

	test("should convert mid-game position correctly", () => {
		const midGameFen =
			"rnbqkb1r/pp2pppp/2p2n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 5"
		const state = parseFen(midGameFen)
		expect(toFen(state)).toBe(midGameFen)
	})

	test("should handle empty squares correctly", () => {
		const emptyBoardFen = "8/8/8/8/8/8/8/8 w - - 0 1"
		const state = parseFen(emptyBoardFen)
		expect(toFen(state)).toBe(emptyBoardFen)
	})

	test("should handle en passant target", () => {
		const enPassantFen =
			"rnbqkbnr/ppp2ppp/8/3p4/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq e3 0 3"
		const state = parseFen(enPassantFen)
		expect(toFen(state)).toBe(enPassantFen)
	})

	test("should handle different castling rights", () => {
		const testCases = [
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w K - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Q - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w k - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w q - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Kk - 0 1",
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Qq - 0 1"
		]

		for (const fen of testCases) {
			const state = parseFen(fen)
			expect(toFen(state)).toBe(fen)
		}
	})

	test("should handle complex positions", () => {
		const complexFen =
			"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
		const state = parseFen(complexFen)
		expect(toFen(state)).toBe(complexFen)
	})

	test("should round-trip all test positions", () => {
		const testPositions = [
			INITIAL_FEN,
			"rnbqkb1r/pp2pppp/2p2n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 5",
			"8/8/8/8/8/8/8/8 w - - 0 1",
			"rnbqkbnr/ppp2ppp/8/3p4/3Pp3/8/PPP2PPP/RNBQKBNR w KQkq e3 0 3",
			"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
		]

		for (const fen of testPositions) {
			expect(toFen(parseFen(fen))).toBe(fen)
		}
	})
})
