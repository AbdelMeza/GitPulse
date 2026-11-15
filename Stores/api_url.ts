const API_URL: string | undefined = (
	import.meta as ImportMeta & { env: { VITE_API_URL?: string } }
).env.VITE_API_URL

export default API_URL