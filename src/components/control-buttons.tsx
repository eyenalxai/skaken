import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ControlButtonsProps = {
	restart: () => void
	isPaused: boolean
	togglePause: () => void
	gameOutcome: string | null
}

export const ControlButtons = ({
	restart,
	isPaused,
	togglePause,
	gameOutcome
}: ControlButtonsProps) => {
	return (
		<div className={cn("flex", "flex-row", "gap-2")}>
			<Button
				onClick={restart}
				variant={gameOutcome === null ? "outline" : "default"}
				className={cn("w-24")}
			>
				restart
			</Button>
			<Button
				disabled={gameOutcome !== null}
				onClick={togglePause}
				variant={"outline"}
				className={cn("w-24")}
			>
				{isPaused ? "resume" : "pause"}
			</Button>
		</div>
	)
}
