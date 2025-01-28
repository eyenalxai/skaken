"use client"

import { cn } from "@/lib/utils"
import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	type UniqueIdentifier,
	useDraggable,
	useDroppable
} from "@dnd-kit/core"
import { useCallback, useState } from "react"
import { createPortal } from "react-dom"

interface ItemProps {
	text: UniqueIdentifier
}

const Item = ({ text }: ItemProps) => {
	return (
		<div
			className={cn(
				"bg-white",
				"border",
				"border-gray-200",
				"rounded-md",
				"p-3",
				"mb-2",
				"cursor-grab",
				"active:cursor-grabbing",
				"select-none",
				"transition-colors",
				"hover:bg-gray-50"
			)}
		>
			{text}
		</div>
	)
}

interface DraggableProps {
	id: UniqueIdentifier
	children: React.ReactNode
}

const Draggable = ({ id, children }: DraggableProps) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: id
	})

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
			}
		: undefined

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes}>
			{children}
		</div>
	)
}

interface DroppableProps {
	id: UniqueIdentifier
	subItems: UniqueIdentifier[]
}

const Droppable = ({ id, subItems }: DroppableProps) => {
	const { setNodeRef } = useDroppable({ id: id })

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"w-[200px]",
				"min-h-[300px]",
				"bg-gray-50",
				"rounded-lg",
				"p-4"
			)}
		>
			<div className={cn("font-semibold", "mb-3", "text-gray-700")}>{id}</div>
			{subItems.map((subItem) => (
				<Draggable id={subItem} key={subItem}>
					<Item text={subItem} />
				</Draggable>
			))}
		</div>
	)
}

const updateItems = (
	oldItems: Record<UniqueIdentifier, UniqueIdentifier[]>,
	activeId: UniqueIdentifier,
	overId: UniqueIdentifier
) => {
	if (oldItems[overId].includes(activeId)) {
		return oldItems
	}

	const newItems: Record<UniqueIdentifier, UniqueIdentifier[]> = {}
	for (const container of Object.keys(oldItems)) {
		newItems[container] = oldItems[container].filter(
			(item) => item !== activeId
		)

		if (container === overId) {
			newItems[container] = [...newItems[container], activeId]
		}
	}

	return newItems
}

export const DndDemo = () => {
	const [items, setItems] = useState<
		Record<UniqueIdentifier, UniqueIdentifier[]>
	>({
		containerA: ["item1", "item3", "item6"],
		containerB: ["item5"],
		containerC: ["item2", "item4"]
	})
	const [activeDraggableId, setActiveDraggableId] =
		useState<UniqueIdentifier | null>(null)

	const moveRandomElement = useCallback(() => {
		setItems((currentItems) => {
			// Get all containers that have items
			const containersWithItems = Object.entries(currentItems).filter(
				([_, items]) => items.length > 0
			)
			if (containersWithItems.length === 0) return currentItems

			// Select random source container and item
			const [sourceContainer, sourceItems] =
				containersWithItems[
					Math.floor(Math.random() * containersWithItems.length)
				]
			const itemToMove =
				sourceItems[Math.floor(Math.random() * sourceItems.length)]

			// Select random target container (different from source)
			const availableTargets = Object.keys(currentItems).filter(
				(container) => container !== sourceContainer
			)
			if (availableTargets.length === 0) return currentItems
			const targetContainer =
				availableTargets[Math.floor(Math.random() * availableTargets.length)]

			// Move the item
			return updateItems(currentItems, itemToMove, targetContainer)
		})
	}, [])

	const onDragStart = useCallback(({ active }: DragStartEvent) => {
		setActiveDraggableId(active.id)
	}, [])

	const onDragCancel = useCallback(() => {
		setActiveDraggableId(null)
	}, [])

	const onDragEnd = useCallback(({ active, over }: DragEndEvent) => {
		setActiveDraggableId(null)

		if (!over || !active) {
			return
		}

		setItems((i) => updateItems(i, active.id, over.id))
	}, [])

	return (
		<div className={cn("p-5")}>
			<button
				type="button"
				onClick={moveRandomElement}
				className={cn(
					"mb-4",
					"px-4",
					"py-2",
					"bg-blue-500",
					"text-white",
					"rounded-md",
					"hover:bg-blue-600",
					"transition-colors",
					"font-medium"
				)}
			>
				Move Random Element
			</button>
			<DndContext
				onDragStart={onDragStart}
				onDragCancel={onDragCancel}
				onDragEnd={onDragEnd}
			>
				<div className={cn("flex", "gap-5")}>
					{Object.keys(items).map((containerId) => (
						<Droppable
							key={containerId}
							id={containerId}
							subItems={items[containerId]}
						/>
					))}
				</div>
				{createPortal(
					<DragOverlay>
						{activeDraggableId ? <Item text={activeDraggableId} /> : null}
					</DragOverlay>,
					document.body
				)}
			</DndContext>
		</div>
	)
}
