import { fetcher } from "@/lib/fetch"

type GetBestMoveMoveProps = {
	fen: string
	maxTime: number
	signal: AbortSignal
}

export const getBestMove = async ({
	fen,
	maxTime,
	signal
}: GetBestMoveMoveProps) => {
	return fetcher({
		endpoint: "/api/stockfish/best-move",
		method: "POST",
		body: {
			fen,
			maxTime
		},
		signal: signal
	}).then((response) => {
		if (!response) return null
		return response.text()
	})
}

type GetBestMoveFromListProps = {
	fen: string
	moves: string[]
	signal: AbortSignal
}

export const getBestMoveFromList = async ({
	fen,
	moves,
	signal
}: GetBestMoveFromListProps) => {
	return fetcher({
		endpoint: "/api/stockfish/best-from-list",
		method: "POST",
		body: {
			fen,
			moves
		},
		signal
	}).then((response) => {
		if (!response) return null
		return response.text()
	})
}
