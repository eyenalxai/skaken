import { describe, expect, it } from "vitest"
import { INITIAL_FEN, parseFen } from "./chess"
import { perft } from "./perft"

describe("perft", () => {
	it("should calculate correct perft values for initial position", () => {
		const state = parseFen(INITIAL_FEN)

		const results = [
			{
				depth: 0,
				expected: {
					nodes: 1,
					captures: 0,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 1,
				expected: {
					nodes: 20,
					captures: 0,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 400,
					captures: 0,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 8902,
					captures: 34,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 12,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 4,
				expected: {
					nodes: 197281,
					captures: 1576,
					enPassant: 0,
					castles: 0,
					promotions: 0,
					checks: 469,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 8
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})

	it("should calculate correct perft values for position 2", () => {
		const state = parseFen(
			"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
		)

		const results = [
			{
				depth: 1,
				expected: {
					nodes: 48,
					captures: 8,
					enPassant: 0,
					castles: 2,
					promotions: 0,
					checks: 0,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 2,
				expected: {
					nodes: 2039,
					captures: 351,
					enPassant: 1,
					castles: 91,
					promotions: 0,
					checks: 3,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 0
				}
			},
			{
				depth: 3,
				expected: {
					nodes: 97862,
					captures: 17102,
					enPassant: 85,
					castles: 3162,
					promotions: 0,
					checks: 993,
					discoveryChecks: 0,
					doubleChecks: 0,
					checkmates: 1
				}
			}
		]

		for (const { depth, expected } of results) {
			const result = perft(state, depth)
			expect(result).toEqual(expected)
		}
	})
})
