import type { GameOutcome } from "@/lib/use-chess-game"
import { cn } from "@/lib/utils"

type OutcomeStatusProps = {
	gameOutcome: GameOutcome | null
}

export const OutcomeStatus = ({ gameOutcome }: OutcomeStatusProps) => {
	const outcomeText: Record<GameOutcome, string> = {
		"threefold-repetition": "threefold repetition",
		draw: "draw",
		checkmate: "checkmate",
		stalemate: "stalemate",
		"insufficient-material": "insufficient material"
	}

	if (gameOutcome === null) return null

	return (
		<p className={cn("font-semibold", "text-red-500", "text-xl")}>
			{outcomeText[gameOutcome]}
		</p>
	)
}
