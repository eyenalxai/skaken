import { describe, expect, it } from "vitest"
import { parseFen } from "./chess"
import { perft } from "./perft"

describe("perft", () => {
	it("should calculate correct perft values for position 1", () => {
		const fen =
			"r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1"
		const state = parseFen(fen)

		const results = [
			{
				depth: 1,
				expected: {
					nodes: 6,
					captures: 0,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 264,
					captures: 87,
					enPassant: 0,
					castles: 6,
					promotions: 48,
					checks: 10,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 9467,
					captures: 1021,
					enPassant: 4,
					castles: 0,
					promotions: 120,
					checks: 38,
					checkmates: 22
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})
})
