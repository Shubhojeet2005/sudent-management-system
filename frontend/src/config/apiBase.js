/**
 * API base URL for fetch calls.
 * - Local dev: empty string → Vite proxies /api to :5001
 * - Vercel monorepo: /_/backend on same origin (when VITE_API_URL not set)
 * - Split deploy: set VITE_API_URL in Vercel to your backend URL at build time
 */
export function getApiBase() {
	const fromEnv = import.meta.env.VITE_API_URL?.trim();
	if (fromEnv) {
		return fromEnv.replace(/\/$/, '');
	}

	if (import.meta.env.DEV) {
		return '';
	}

	if (typeof window !== 'undefined') {
		return `${window.location.origin}/_/backend`;
	}

	return '';
}
