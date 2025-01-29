import { describe, expect, it } from "vitest"
import { ChessGame } from "./game"
import {
	CaptureOnlyStrategy,
	MinimaxStrategy,
	RandomStrategy
} from "./strategy"

describe("Chess Strategies", () => {
	describe("RandomStrategy", () => {
		it("should always return a valid move", () => {
			const game = new ChessGame()
			const strategy = new RandomStrategy()
			const move = strategy.getMove(game)

			expect(move).not.toBeNull()
			if (!move) return
			expect(game.getValidMoves(move.from)).toContainEqual(move)
		})

		it("should return null when no moves are available", () => {
			// Fool's mate position - Black is checkmated
			const game = new ChessGame(
				"rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1"
			)
			const strategy = new RandomStrategy()
			const move = strategy.getMove(game)

			expect(move).toBeNull()
		})
	})

	describe("CaptureOnlyStrategy", () => {
		it("should prefer capture moves when available", () => {
			// Position with an obvious capture (white pawn can capture black pawn)
			const game = new ChessGame(
				"rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1"
			)
			const strategy = new CaptureOnlyStrategy()
			const move = strategy.getMove(game)

			expect(move).not.toBeNull()
			if (!move) return
			expect(move.from).toBe("e4")
			expect(move.to).toBe("d5")
		})

		it("should make non-capture moves when no captures are available", () => {
			const game = new ChessGame() // Initial position - no captures available
			const strategy = new CaptureOnlyStrategy()
			const move = strategy.getMove(game)

			expect(move).not.toBeNull()
			if (!move) return
			// Verify it's a valid move
			expect(game.getValidMoves(move.from)).toContainEqual(move)
		})
	})

	describe("MinimaxStrategy", () => {
		it("should find mate in one", () => {
			// Position where white can mate in one with Qh6#
			const game = new ChessGame(
				"4r2k/1p3rbp/2p1N1p1/p3n3/P2NB1nq/1P6/4R1P1/B1Q2RK1 b - - 4 32"
			)
			const strategy = new MinimaxStrategy(1)
			const move = strategy.getMove(game)

			expect(move).not.toBeNull()
			if (!move) return
			expect(move.from).toBe("h4")
			expect(move.to).toBe("h2")

			// Verify it's actually mate
			game.makeMove(move)
			expect(game.getStatus()).toBe("checkmate")
		})

		it("should find mate in two", () => {
			// Position where white can mate in one with Qh6#
			const game = new ChessGame(
				"4r3/1pp2rbk/6pn/4n3/P3BN1q/1PB2bPP/8/2Q1RRK1 b - - 0 31"
			)
			const strategy = new MinimaxStrategy(2)
			const move = strategy.getMove(game)

			expect(move).not.toBeNull()
			if (!move) return
			expect(move.from).toBe("h4")
			expect(move.to).toBe("g3")

			// Verify it's actually mate
			game.makeMove(move)
			expect(game.getStatus()).toBe("check")
		})

		it("should capture free piece", () => {
			// Position where white can capture an undefended queen
			const game = new ChessGame("4k3/8/8/3q4/4P3/8/8/4K3 w - - 0 1")
			const strategy = new MinimaxStrategy(2)
			const move = strategy.getMove(game)

			expect(move).not.toBeNull()
			if (!move) return
			expect(move.from).toBe("e4")
			expect(move.to).toBe("d5")
		})
	})

	describe("Strategy integration with ChessGame", () => {
		it("should use different strategies for white and black", () => {
			const game = new ChessGame()
			const whiteStrategy = new MinimaxStrategy(2)
			const blackStrategy = new CaptureOnlyStrategy()

			game.setWhiteStrategy(whiteStrategy)
			game.setBlackStrategy(blackStrategy)

			expect(game.getWhiteStrategy()).toBe(whiteStrategy)
			expect(game.getBlackStrategy()).toBe(blackStrategy)
		})

		it("should fall back to minimax depth 1 when no strategy is set", () => {
			// Position where capturing the queen is the obvious best move
			const game = new ChessGame("4k3/8/8/3q4/4P3/8/8/4K3 w - - 0 1")

			// Make a move with no strategy set
			const success = game.makeStrategyMove()
			expect(success).toBe(true)

			// The fallback strategy should have captured the queen
			const state = game.getState()
			expect(state.board[3][3]).toBe("wp") // e4 pawn should now be on d5
		})

		it("should alternate between white and black strategies", () => {
			const game = new ChessGame()
			let moveCount = 0

			// Set up spy strategies that count their invocations
			const whiteStrategy = {
				getMove: (g: ChessGame) => {
					moveCount++
					return new MinimaxStrategy(1).getMove(g)
				}
			}
			const blackStrategy = {
				getMove: (g: ChessGame) => {
					moveCount++
					return new MinimaxStrategy(1).getMove(g)
				}
			}

			game.setWhiteStrategy(whiteStrategy)
			game.setBlackStrategy(blackStrategy)

			// Make a few moves
			game.makeStrategyMove() // White
			game.makeStrategyMove() // Black
			game.makeStrategyMove() // White

			expect(moveCount).toBe(3)
		})
	})
})
