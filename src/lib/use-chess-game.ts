"use client"

import { ChessGame } from "@/lib/chess/game"
import type { Color, Square } from "@/lib/chess/state"
import {
	berserkMove,
	pacifistMove,
	randomMove
} from "@/lib/chess/strategy/basic"
import { getBestMove } from "@/lib/chess/strategy/stockfish"
import {
	type GameOutcome,
	type PlayerControls,
	type SetPlayerStrategy,
	type Strategy,
	exhaustiveCheck
} from "@/lib/types"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export const useChessGame = () => {
	const [chessboard, setChessboard] = useState(new ChessGame())
	const [playerControls, setPlayerControls] = useState<PlayerControls>({
		w: "random-move",
		b: "random-move"
	})
	const [isPaused, setIsPaused] = useState(true)
	const [gameOutcome, setGameOutcome] = useState<GameOutcome | null>(null)

	const restart = () => {
		setChessboard(new ChessGame())
		setGameOutcome(null)
		setPlayerControls({ w: "random-move", b: "random-move" })
		setIsPaused(false)
	}

	const togglePause = () => setIsPaused((prev) => !prev)

	const setPlayerStrategy: SetPlayerStrategy = ({
		player,
		strategy
	}: { player: Color; strategy: Strategy }) => {
		setPlayerControls((prev) => {
			const newPlayerControls = { ...prev }
			newPlayerControls[player] = strategy
			return newPlayerControls
		})
	}

	useEffect(() => {
		const status = chessboard.getStatus()
		switch (status) {
			case "checkmate":
				setGameOutcome("checkmate")
				break
			case "stalemate":
				setGameOutcome("stalemate")
				break
			case "check":
			case "active":
				// Game continues
				break
			default:
				exhaustiveCheck(status)
		}
	}, [chessboard])

	useEffect(() => {
		if (isPaused) return
		if (gameOutcome !== null) return

		const state = chessboard.getState()
		const strategy = playerControls[state.activeColor]

		const controller = new AbortController()
		const signal = controller.signal

		const makeMove = async () => {
			const executeStrategy = () => {
				const fen = chessboard.getFen()
				switch (strategy) {
					case "random-move":
						return randomMove(fen)
					case "stockfish":
						return getBestMove(fen, 200, signal)
					case "berserk":
						return berserkMove(fen, signal)
					case "pacifist":
						return pacifistMove(fen, signal)
					default:
						return exhaustiveCheck(strategy)
				}
			}

			const chessMove = await executeStrategy()
			console.log(
				`chess move with strategy ${strategy} for color ${state.activeColor}: ${JSON.stringify(
					chessMove
				)}`
			)
			if (chessMove === null) return

			const chessboardCopy = new ChessGame(chessboard.getFen())
			if (typeof chessMove === "string") {
				chessboardCopy.makeMove({
					from: chessMove.slice(0, 2) as Square,
					to: chessMove.slice(2, 4) as Square,
					promotion: chessMove[4] as "q" | "r" | "b" | "n" | undefined
				})
			} else {
				chessboardCopy.makeMove(chessMove)
			}
			setChessboard(chessboardCopy)
		}

		const timeout = setTimeout(() => {
			makeMove().catch((error) => {
				const errorMessage = `Error making move: ${error}`
				console.error(errorMessage)
				return toast.error(errorMessage)
			})
		}, 400)

		return () => {
			clearTimeout(timeout)
			controller.abort()
		}
	}, [playerControls, chessboard, gameOutcome, isPaused])

	return {
		chessboard,
		disabled: gameOutcome !== null || isPaused,
		playerControls,
		setPlayerStrategy,
		gameOutcome,
		restart,
		isPaused,
		togglePause
	}
}
