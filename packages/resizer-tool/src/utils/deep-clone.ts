export const deepClone = <T>(value: T): T => {
	const cache = new Map();
	function _deepClone<U, V extends keyof U>(value: U) {
		if (value === null || typeof value !== "object") {
			return value;
		}
		if (cache.has(value)) return cache.get(value);
		const result = Array.isArray(value) ? [] : {};
		cache.set(value, result);
		for (let key in value) (result as Record<string, V>)[key] = _deepClone(value[key]);

		return result;
	}
	return _deepClone(value);
};
