"use client"

import type { GameState, PieceType } from "@/lib/chess/state"
import { cn } from "@/lib/utils"
import { Piece } from "@chessire/pieces"
import { motion } from "framer-motion"
import { useRef } from "react"

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
	// Keep track of piece IDs based on their initial positions
	const pieceIds = useRef(new Map<string, string>())

	// Generate a unique ID for a piece that persists across moves
	const getPieceId = (piece: string) => {
		if (!pieceIds.current.has(piece)) {
			pieceIds.current.set(piece, `piece-${piece}-${pieceIds.current.size + 1}`)
		}
		const id = pieceIds.current.get(piece)
		if (!id) {
			throw new Error(
				`Piece ID not found after setting it. This should never happen. Piece: ${piece}`
			)
		}
		return id
	}

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
								<motion.div
									layoutId={getPieceId(piece)}
									className={cn(
										"flex",
										"justify-center",
										"items-center",
										"w-8",
										"h-8"
									)}
									transition={{
										type: "spring",
										stiffness: 200,
										damping: 20
									}}
									layout
								>
									<Piece
										color={piece[0] === "w" ? "white" : "black"}
										piece={pieceMap[piece[1] as PieceType]}
										width={32}
									/>
								</motion.div>
							)}
						</div>
					)
				})
			)}
		</div>
	)
}
