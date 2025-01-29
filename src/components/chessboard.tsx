"use client"

import type { GameState, PieceType } from "@/lib/chess/state"
import { cn } from "@/lib/utils"
import { Piece } from "@chessire/pieces"

const pieceMap: Record<PieceType, "K" | "Q" | "R" | "B" | "N" | "P"> = {
	k: "K",
	q: "Q",
	r: "R",
	b: "B",
	n: "N",
	p: "P"
}

type ChessboardProps = {
	gameState: GameState
}

export const Chessboard = ({ gameState }: ChessboardProps) => {
	return (
		<div
			className={cn(
				"grid",
				"grid-cols-8",
				"aspect-square",
				"w-full",
				"border",
				"border-border",
				"rounded-md",
				"overflow-hidden",
				"relative"
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
								<div
									className={cn(
										"flex",
										"justify-center",
										"items-center",
										"w-8",
										"h-8"
									)}
								>
									<Piece
										color={piece[0] === "w" ? "white" : "black"}
										piece={pieceMap[piece[1] as PieceType]}
										width={32}
									/>
								</div>
							)}
						</div>
					)
				})
			)}
		</div>
	)
}
