"use client"

import { ChessGame } from "@/lib/chess/game"
import type { GameState, PieceType } from "@/lib/chess/state"
import { DEFAULT_FEN, parseFen } from "@/lib/chess/state"
import {
	CaptureOnlyStrategy,
	MinimaxStrategy,
	RandomStrategy
} from "@/lib/chess/strategy"
import { cn } from "@/lib/utils"
import { Piece } from "@chessire/pieces"
import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "./ui/select"

const BOARD_SIZE = 8

const pieceMap: Record<PieceType, "K" | "Q" | "R" | "B" | "N" | "P"> = {
	k: "K",
	q: "Q",
	r: "R",
	b: "B",
	n: "N",
	p: "P"
}

const STRATEGY_OPTIONS = [
	{ value: "random", label: "Random" },
	{ value: "capture", label: "Capture Only" },
	{ value: "minimax-1", label: "Minimax (Depth 1)" },
	{ value: "minimax-2", label: "Minimax (Depth 2)" },
	{ value: "minimax-3", label: "Minimax (Depth 3)" }
]

const getStrategy = (strategyValue: string) => {
	if (strategyValue === "none") return null
	if (strategyValue === "random") return new RandomStrategy()
	if (strategyValue === "capture") return new CaptureOnlyStrategy()
	if (strategyValue.startsWith("minimax-")) {
		return new MinimaxStrategy(Number(strategyValue.split("-")[1]) || 2)
	}
	return null
}

export const Chessboard = () => {
	const [gameState, setGameState] = useState<GameState>(parseFen(DEFAULT_FEN))
	const [isPlaying, setIsPlaying] = useState(false)
	const [customFen, setCustomFen] = useState(DEFAULT_FEN)
	const [whiteStrategy, setWhiteStrategy] = useState("random")
	const [blackStrategy, setBlackStrategy] = useState("random")
	const [statusMessage, setStatusMessage] = useState<string>("")
	const gameRef = useRef<ChessGame>(new ChessGame(DEFAULT_FEN, BOARD_SIZE))
	const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

	useEffect(() => {
		const game = gameRef.current
		game.setWhiteStrategy(getStrategy(whiteStrategy))
		game.setBlackStrategy(getStrategy(blackStrategy))
	}, [whiteStrategy, blackStrategy])

	const updateGameStatus = () => {
		const game = gameRef.current
		const state = game.getState()
		const status = game.getStatus()

		switch (status) {
			case "checkmate":
				setStatusMessage(
					`Game Over - ${state.activeColor === "w" ? "Black" : "White"} wins by checkmate!`
				)
				return true
			case "stalemate":
				setStatusMessage("Game Over - Draw by stalemate!")
				return true
			case "check":
				setStatusMessage(
					`${state.activeColor === "w" ? "White" : "Black"} is in check!`
				)
				return false
			default:
				setStatusMessage(
					`${state.activeColor === "w" ? "White" : "Black"} to move`
				)
				return false
		}
	}

	const startGame = () => {
		setIsPlaying(true)
		updateGameStatus()
		intervalRef.current = setInterval(() => {
			const game = gameRef.current
			const state = game.getState()
			const gameEnded = updateGameStatus()

			if (gameEnded) {
				stopGame()
				return
			}

			const activeStrategy =
				state.activeColor === "w"
					? game.getWhiteStrategy()
					: game.getBlackStrategy()

			if (activeStrategy) {
				game.makeStrategyMove()
				setGameState({ ...game.getState() })
			}
		}, 200)
	}

	const stopGame = () => {
		setIsPlaying(false)
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
		}
	}

	const resetGame = () => {
		stopGame()
		try {
			gameRef.current = new ChessGame(customFen, BOARD_SIZE)
			setGameState(gameRef.current.getState())
			setStatusMessage("Game reset - White to move")
		} catch (error) {
			console.error("Invalid FEN:", error)
			gameRef.current = new ChessGame(DEFAULT_FEN, BOARD_SIZE)
			setGameState(gameRef.current.getState())
			setCustomFen(DEFAULT_FEN)
			setStatusMessage("Invalid FEN - Game reset to starting position")
		}
	}

	return (
		<div
			className={cn(
				"flex",
				"flex-col",
				"gap-4",
				"items-center",
				"w-full",
				"max-w-[600px]"
			)}
		>
			<div className={cn("flex", "gap-2", "w-full")}>
				<Input
					value={customFen}
					onChange={(e) => setCustomFen(e.target.value)}
					placeholder="Enter FEN string..."
					className={cn("font-mono", "text-sm")}
				/>
				<Button onClick={resetGame}>Reset</Button>
			</div>

			<div className={cn("flex", "gap-2", "w-full")}>
				<Select value={whiteStrategy} onValueChange={setWhiteStrategy}>
					<SelectTrigger>
						<SelectValue placeholder="White Strategy" />
					</SelectTrigger>
					<SelectContent>
						{STRATEGY_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={blackStrategy} onValueChange={setBlackStrategy}>
					<SelectTrigger>
						<SelectValue placeholder="Black Strategy" />
					</SelectTrigger>
					<SelectContent>
						{STRATEGY_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button onClick={isPlaying ? stopGame : startGame}>
					{isPlaying ? "Pause" : "Start"}
				</Button>
			</div>

			<div
				className={cn(
					"grid",
					"grid-cols-8",
					"aspect-square",
					"w-full",
					"border",
					"border-border",
					"rounded-md",
					"overflow-hidden"
				)}
			>
				{gameState.board.map((row, rankIndex) =>
					row.map((piece, fileIndex) => {
						const isLight = (rankIndex + fileIndex) % 2 === 0
						const squareId = `${String.fromCharCode(97 + fileIndex)}${
							8 - rankIndex
						}`

						return (
							<div
								key={squareId}
								className={cn(
									"flex",
									"items-center",
									"justify-center",
									"aspect-square",
									isLight ? "bg-muted" : "bg-muted-foreground"
								)}
							>
								{piece && (
									<Piece
										color={piece[0] === "w" ? "white" : "black"}
										piece={pieceMap[piece[1] as PieceType]}
										width={64}
									/>
								)}
							</div>
						)
					})
				)}
			</div>

			<div
				className={cn(
					"text-center",
					"font-medium",
					"h-6",
					statusMessage.includes("Game Over")
						? "text-primary"
						: "text-muted-foreground"
				)}
			>
				{statusMessage}
			</div>
		</div>
	)
}
