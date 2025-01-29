import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"

type ResolveFunction<T> = (value: T | PromiseLike<T>) => void
type RejectFunction = (reason?: Error) => void

export const getStockfishMove = async (
	fen: string,
	maxTime: number
): Promise<string> => {
	return new Promise((resolve, reject) => {
		spawnStockfish<string>(
			fen,
			maxTime,
			resolve,
			reject,
			stockfishResultHandler
		)
	})
}

export const getBestMoveFromLegalMoves = async (
	fen: string,
	legalMoves: string[],
	maxTimeEach: number
): Promise<string> => {
	const evaluations = await Promise.all(
		legalMoves.map((move) =>
			new Promise<number>((resolve, reject) => {
				spawnStockfish<number>(
					fen,
					maxTimeEach,
					resolve,
					reject,
					stockfishEvaluationHandler,
					move
				)
			}).catch((error) => {
				console.error(`Error evaluating move ${15}:`, error)
				return Number.NEGATIVE_INFINITY
			})
		)
	)

	return legalMoves[
		evaluations.reduce(
			(bestIndex, currentValue, currentIndex) =>
				currentValue > evaluations[bestIndex] ? currentIndex : bestIndex,
			0
		)
	]
}

const spawnStockfish = <T>(
	fen: string,
	maxTime: number,
	resolve: ResolveFunction<T>,
	reject: RejectFunction,
	handler: (data: Buffer, resolve: ResolveFunction<T>) => void,
	move?: string
): ChildProcessWithoutNullStreams => {
	console.log("Spawning stockfish")
	const stockfish = spawn("stockfish")

	const cleanupAndResolve: ResolveFunction<T> = (value) => {
		stockfish.kill()
		resolve(value)
	}

	const cleanupAndReject = (reason?: Error) => {
		stockfish.kill()
		reject(reason)
	}

	stockfish.stdin.write("uci\n")
	stockfish.stdin.write(`position fen ${fen}${move ? ` moves ${move}` : ""}\n`)
	stockfish.stdin.write(`go movetime ${maxTime}\n`)

	stockfish.stdout.on("data", (data: Buffer) =>
		handler(data, cleanupAndResolve)
	)
	stockfish.stderr.on("data", (data: Buffer) =>
		cleanupAndReject(new Error(`Stockfish error: ${data.toString()}`))
	)

	stockfish.on("error", cleanupAndReject)

	stockfish.on("close", (code: number) => {
		if (code !== 0)
			cleanupAndReject(new Error(`Stockfish exited with code ${code}`))
	})

	return stockfish
}

const stockfishResultHandler = (
	data: Buffer,
	resolve: ResolveFunction<string>
) => {
	const output = data.toString()
	const match = output.match(/^bestmove\s(\S+)/m)
	if (match) {
		const bestMove = match[1]
		resolve(bestMove)
	}
}

const stockfishEvaluationHandler = (
	data: Buffer,
	resolve: ResolveFunction<number>
) => {
	const output = data.toString()
	let depthReached = 0
	const depthMatch = output.match(/depth (\d+)/)
	if (depthMatch) {
		depthReached = Number.parseInt(depthMatch[1], 10)
	}
	if (/bestmove/.test(output)) {
		resolve(depthReached)
	}
}
