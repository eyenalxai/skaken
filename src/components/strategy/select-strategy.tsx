import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select"
import type { Color } from "@/lib/chess/state"
import type { SetPlayerStrategy, Strategy } from "@/lib/use-chess-game"
import { cn } from "@/lib/utils"

type SelectStrategyProps = {
	value: Strategy
	player: Color
	setPlayerStrategy: SetPlayerStrategy
}

export const SelectStrategy = ({
	value,
	player,
	setPlayerStrategy
}: SelectStrategyProps) => {
	const strategyNames: Record<Strategy, string> = {
		"random-move": "random move",
		stockfish: "stockfish",
		berserk: "berserk",
		pacifist: "pacifist"
	}

	const playerColor = player === "w" ? "white" : "black"

	return (
		<div className={cn("flex", "flex-col", "justify-center", "items-start")}>
			<Select
				value={value}
				onValueChange={(value) => {
					setPlayerStrategy({
						player: player,
						strategy: value as Strategy
					})
				}}
			>
				<SelectTrigger className={cn("w-36")}>
					<SelectValue placeholder={`${playerColor} strategy`} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>{playerColor}</SelectLabel>
						{Object.entries(strategyNames).map(([strategy, name]) => (
							<SelectItem key={strategy} value={strategy}>
								{name}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	)
}
