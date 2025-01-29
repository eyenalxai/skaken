import type { Color } from "@/lib/chess/state"

export type Strategy = "random-move" | "stockfish" | "berserk" | "pacifist"

export type PlayerControls = {
	[key in Color]: Strategy
}

export type GameOutcome =
	| "threefold-repetition"
	| "draw"
	| "checkmate"
	| "stalemate"
	| "insufficient-material"

export type SetPlayerStrategy = ({
	player,
	strategy
}: { player: Color; strategy: Strategy }) => void

export const exhaustiveCheck = (_: never): never => {
	throw new Error("Exhaustive check failed")
}
