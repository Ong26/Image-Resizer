import { randomUUID } from "crypto";
export const generateId = (method?: string): string => {
	if (method === "id") return randomUUID().toString();
	else return Date.now().toString();
};
