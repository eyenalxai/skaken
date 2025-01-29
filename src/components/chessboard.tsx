"use client"

import { ChessGame } from "@/lib/chess/game"
import type { GameState, PieceType } from "@/lib/chess/state"
import { DEFAULT_FEN, parseFen } from "@/lib/chess/state"
import { cn } from "@/lib/utils"
import { Piece } from "@chessire/pieces"
import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

const BOARD_SIZE = 8

const pieceMap: Record<PieceType, "K" | "Q" | "R" | "B" | "N" | "P"> = {
	k: "K",
	q: "Q",
	r: "R",
	b: "B",
	n: "N",
	p: "P"
}

export const Chessboard = () => {
	const [gameState, setGameState] = useState<GameState>(parseFen(DEFAULT_FEN))
	const [customFen, setCustomFen] = useState(DEFAULT_FEN)
	const [statusMessage, setStatusMessage] = useState<string>("")
	const gameRef = useRef<ChessGame>(new ChessGame(DEFAULT_FEN, BOARD_SIZE))

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

	const resetGame = () => {
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
