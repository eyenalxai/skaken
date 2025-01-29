import { getStockfishMove } from "@/lib/chess/stockfish"
import { NextResponse } from "next/server"

export const POST = async (request: Request) => {
	const { fen, maxTime }: { fen: string; maxTime: number } =
		await request.json()

	try {
		const bestMove = await getStockfishMove(fen, maxTime)
		return new NextResponse(bestMove)
	} catch (error) {
		return new NextResponse(error?.toString() || "Error finding best move", {
			status: 500
		})
	}
}
