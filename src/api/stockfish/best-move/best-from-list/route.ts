import { getBestMoveFromLegalMoves } from "@/lib/chess/stockfish"
import { NextResponse } from "next/server"

export const POST = async (request: Request) => {
	const { fen, moves }: { fen: string; moves: string[] } = await request.json()

	try {
		const bestMove = await getBestMoveFromLegalMoves(fen, moves, 10)
		return new NextResponse(bestMove)
	} catch (error) {
		return new NextResponse(error?.toString() || "Error finding best move", {
			status: 500
		})
	}
}
