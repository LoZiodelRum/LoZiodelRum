const isNode = typeof window === 'undefined';

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/** Legge parametri da URL o env. Nessun localStorage - solo Supabase come persistenza. */
const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) return searchParam;
	if (defaultValue !== undefined) return defaultValue;
	return null;
}

const getAppParams = () => {
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_LoZiodelRum_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: typeof window !== 'undefined' ? window.location.href : '' }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_LoZiodelRum_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_LoZiodelRum_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}