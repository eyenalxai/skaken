import type { FenResult, Piece, Square } from "@/lib/chess"
import { parseFen } from "@/lib/chess"
import { INITIAL_FEN } from "@/lib/chess"
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
})
