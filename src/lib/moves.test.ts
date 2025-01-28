import { type Square, parseFen } from "@/lib/chess"
import { type Move, getValidMoves } from "@/lib/moves"
import { describe, expect, test } from "vitest"

const expectMoves = (moves: Move[], expectedMoves: Move[]) => {
	expect(moves.length).toBe(expectedMoves.length)
	for (const expected of expectedMoves) {
		expect(moves).toContainEqual(expected)
	}
}

describe("getValidMoves", () => {
	test("initial pawn moves", () => {
		const state = parseFen(
			"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
		)
		const moves = getValidMoves(state, "e2" as Square)

		expectMoves(moves, [
			{ from: "e2" as Square, to: "e3" as Square },
			{ from: "e2" as Square, to: "e4" as Square }
		])
	})

	test("blocked pawn", () => {
		const state = parseFen(
			"rnbqkbnr/pppppppp/8/8/4P3/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 1"
		)
		const moves = getValidMoves(state, "e3" as Square)

		expectMoves(moves, [])
	})

	test("pawn captures", () => {
		const state = parseFen(
			"rnbqkbnr/ppp1p1pp/8/3p1p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1"
		)
		const moves = getValidMoves(state, "e4" as Square)

		expectMoves(moves, [
			{ from: "e4" as Square, to: "e5" as Square },
			{ from: "e4" as Square, to: "d5" as Square },
			{ from: "e4" as Square, to: "f5" as Square }
		])
	})

	test("pawn promotion", () => {
		const state = parseFen("8/4P3/8/8/8/8/8/8 w - - 0 1")
		const moves = getValidMoves(state, "e7" as Square)

		expectMoves(moves, [
			{ from: "e7" as Square, to: "e8" as Square, promotion: "q" },
			{ from: "e7" as Square, to: "e8" as Square, promotion: "r" },
			{ from: "e7" as Square, to: "e8" as Square, promotion: "b" },
			{ from: "e7" as Square, to: "e8" as Square, promotion: "n" }
		])
	})

	test("en passant capture", () => {
		const state = parseFen(
			"rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 1"
		)
		const moves = getValidMoves(state, "e5" as Square)

		expectMoves(moves, [
			{ from: "e5" as Square, to: "e6" as Square },
			{ from: "e5" as Square, to: "f6" as Square }
		])
	})

	test("knight moves", () => {
		const state = parseFen("8/8/8/3N4/8/8/8/8 w - - 0 1")
		const moves = getValidMoves(state, "d5" as Square)

		expectMoves(moves, [
			{ from: "d5" as Square, to: "b4" as Square },
			{ from: "d5" as Square, to: "b6" as Square },
			{ from: "d5" as Square, to: "c3" as Square },
			{ from: "d5" as Square, to: "c7" as Square },
			{ from: "d5" as Square, to: "e3" as Square },
			{ from: "d5" as Square, to: "e7" as Square },
			{ from: "d5" as Square, to: "f4" as Square },
			{ from: "d5" as Square, to: "f6" as Square }
		])
	})

	test("bishop moves", () => {
		const state = parseFen("8/8/8/3B4/8/8/8/8 w - - 0 1")
		const moves = getValidMoves(state, "d5" as Square)

		const expectedMoves = [
			// Northeast
			{ from: "d5" as Square, to: "e6" as Square },
			{ from: "d5" as Square, to: "f7" as Square },
			{ from: "d5" as Square, to: "g8" as Square },
			// Southeast
			{ from: "d5" as Square, to: "e4" as Square },
			{ from: "d5" as Square, to: "f3" as Square },
			{ from: "d5" as Square, to: "g2" as Square },
			{ from: "d5" as Square, to: "h1" as Square },
			// Southwest
			{ from: "d5" as Square, to: "c4" as Square },
			{ from: "d5" as Square, to: "b3" as Square },
			{ from: "d5" as Square, to: "a2" as Square },
			// Northwest
			{ from: "d5" as Square, to: "c6" as Square },
			{ from: "d5" as Square, to: "b7" as Square },
			{ from: "d5" as Square, to: "a8" as Square }
		]

		expectMoves(moves, expectedMoves)
	})

	test("rook moves", () => {
		const state = parseFen("8/8/8/3R4/8/8/8/8 w - - 0 1")
		const moves = getValidMoves(state, "d5" as Square)

		const expectedMoves = [
			// North
			{ from: "d5" as Square, to: "d6" as Square },
			{ from: "d5" as Square, to: "d7" as Square },
			{ from: "d5" as Square, to: "d8" as Square },
			// East
			{ from: "d5" as Square, to: "e5" as Square },
			{ from: "d5" as Square, to: "f5" as Square },
			{ from: "d5" as Square, to: "g5" as Square },
			{ from: "d5" as Square, to: "h5" as Square },
			// South
			{ from: "d5" as Square, to: "d4" as Square },
			{ from: "d5" as Square, to: "d3" as Square },
			{ from: "d5" as Square, to: "d2" as Square },
			{ from: "d5" as Square, to: "d1" as Square },
			// West
			{ from: "d5" as Square, to: "c5" as Square },
			{ from: "d5" as Square, to: "b5" as Square },
			{ from: "d5" as Square, to: "a5" as Square }
		]

		expectMoves(moves, expectedMoves)
	})

	test("queen moves", () => {
		const state = parseFen("8/8/8/3Q4/8/8/8/8 w - - 0 1")
		const moves = getValidMoves(state, "d5" as Square)

		const expectedMoves = [
			// North
			{ from: "d5" as Square, to: "d6" as Square },
			{ from: "d5" as Square, to: "d7" as Square },
			{ from: "d5" as Square, to: "d8" as Square },
			// Northeast
			{ from: "d5" as Square, to: "e6" as Square },
			{ from: "d5" as Square, to: "f7" as Square },
			{ from: "d5" as Square, to: "g8" as Square },
			// East
			{ from: "d5" as Square, to: "e5" as Square },
			{ from: "d5" as Square, to: "f5" as Square },
			{ from: "d5" as Square, to: "g5" as Square },
			{ from: "d5" as Square, to: "h5" as Square },
			// Southeast
			{ from: "d5" as Square, to: "e4" as Square },
			{ from: "d5" as Square, to: "f3" as Square },
			{ from: "d5" as Square, to: "g2" as Square },
			{ from: "d5" as Square, to: "h1" as Square },
			// South
			{ from: "d5" as Square, to: "d4" as Square },
			{ from: "d5" as Square, to: "d3" as Square },
			{ from: "d5" as Square, to: "d2" as Square },
			{ from: "d5" as Square, to: "d1" as Square },
			// Southwest
			{ from: "d5" as Square, to: "c4" as Square },
			{ from: "d5" as Square, to: "b3" as Square },
			{ from: "d5" as Square, to: "a2" as Square },
			// West
			{ from: "d5" as Square, to: "c5" as Square },
			{ from: "d5" as Square, to: "b5" as Square },
			{ from: "d5" as Square, to: "a5" as Square },
			// Northwest
			{ from: "d5" as Square, to: "c6" as Square },
			{ from: "d5" as Square, to: "b7" as Square },
			{ from: "d5" as Square, to: "a8" as Square }
		]

		expectMoves(moves, expectedMoves)
	})

	test("king moves", () => {
		const state = parseFen("8/8/8/3K4/8/8/8/8 w - - 0 1")
		const moves = getValidMoves(state, "d5" as Square)

		expectMoves(moves, [
			{ from: "d5" as Square, to: "c4" as Square },
			{ from: "d5" as Square, to: "c5" as Square },
			{ from: "d5" as Square, to: "c6" as Square },
			{ from: "d5" as Square, to: "d4" as Square },
			{ from: "d5" as Square, to: "d6" as Square },
			{ from: "d5" as Square, to: "e4" as Square },
			{ from: "d5" as Square, to: "e5" as Square },
			{ from: "d5" as Square, to: "e6" as Square }
		])
	})

	test("kingside castling", () => {
		const state = parseFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1")
		const moves = getValidMoves(state, "e1" as Square)

		expect(moves).toContainEqual({ from: "e1" as Square, to: "g1" as Square })
	})

	test("queenside castling", () => {
		const state = parseFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1")
		const moves = getValidMoves(state, "e1" as Square)

		expect(moves).toContainEqual({ from: "e1" as Square, to: "c1" as Square })
	})

	test("cannot move into check", () => {
		const state = parseFen("8/8/8/3k4/4R3/8/8/4K3 b - - 0 1")
		const moves = getValidMoves(state, "d5" as Square)

		// King can't move to e5 or d4 because of the white rook
		expectMoves(moves, [
			{ from: "d5" as Square, to: "c4" as Square },
			{ from: "d5" as Square, to: "c5" as Square },
			{ from: "d5" as Square, to: "c6" as Square },
			{ from: "d5" as Square, to: "d6" as Square },
			{ from: "d5" as Square, to: "e6" as Square }
		])
	})

	test("must move out of check", () => {
		const state = parseFen("4k3/8/8/3r4/8/8/4P3/4K3 w - - 0 1")
		const moves = getValidMoves(state, "e1" as Square)

		// King must move out of check, can't move to e2 because of the black rook
		expectMoves(moves, [
			{ from: "e1" as Square, to: "d1" as Square },
			{ from: "e1" as Square, to: "d2" as Square },
			{ from: "e1" as Square, to: "f1" as Square },
			{ from: "e1" as Square, to: "f2" as Square }
		])
	})

	test("pinned piece cannot move", () => {
		const state = parseFen("4k3/8/8/8/3B4/8/4P3/4K3 b - - 0 1")
		const moves = getValidMoves(state, "e2" as Square)

		// Pawn is pinned to the king by the bishop, cannot move
		expectMoves(moves, [])
	})
})
