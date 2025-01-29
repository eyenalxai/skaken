"use client"

import { Chessboard } from "@/components/chessboard"
import { ControlButtons } from "@/components/control-buttons"
import { OutcomeStatus } from "@/components/outcome-status"
import { SelectStrategies } from "@/components/select-strategies"
import { useChessGame } from "@/lib/use-chess-game"
import { cn } from "@/lib/utils"

export default function Home() {
	const {
		chessboard,
		playerControls,
		setPlayerStrategy,
		gameOutcome,
		restart,
		isPaused,
		togglePause
	} = useChessGame()

	return (
		<div className={cn("flex", "flex-col", "items-start", "gap-y-2")}>
			<SelectStrategies
				playerControls={playerControls}
				setPlayerStrategy={setPlayerStrategy}
			/>
			<div
				className={cn([
					"size-[320px]",
					"sm:size-[360pcx]",
					"md:size-[480px]",
					"lg:size-[560px]",
					"xl:size-[600px]"
				])}
			>
				<Chessboard gameState={chessboard.getState()} />
			</div>
			<div
				className={cn(
					"w-full",
					"flex",
					"flex-row",
					"justify-between",
					"items-center"
				)}
			>
				<ControlButtons
					restart={restart}
					togglePause={togglePause}
					isPaused={isPaused}
					gameOutcome={gameOutcome}
				/>
				<OutcomeStatus gameOutcome={gameOutcome} />
			</div>
		</div>
	)
}
