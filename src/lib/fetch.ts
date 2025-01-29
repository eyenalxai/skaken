import { toast } from "sonner"

type FetcherProps = {
	endpoint: string
	method?: "GET" | "POST" | "PATCH"
	body?: Record<string, unknown>
	signal?: AbortSignal
}

export const fetcher = ({ endpoint, method, body, signal }: FetcherProps) => {
	return fetch(endpoint, {
		method: method ?? "GET",
		body: body !== undefined ? JSON.stringify(body) : undefined,
		cache: "no-store",
		signal: signal
	})
		.then((response) => {
			if (!response.ok) {
				toast.error(`Error: ${response.status} ${response.statusText}`)
				return null
			}
			return response
		})
		.catch((error) => {
			if (error.name === "AbortError") return null
			toast.error(`${error}`)
			return null
		})
}
