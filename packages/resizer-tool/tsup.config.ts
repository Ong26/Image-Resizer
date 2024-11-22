import { defineConfig } from "tsup";
export default defineConfig({
	entry: ["src/**/*.ts"],
	format: ["cjs", "esm"],
	sourcemap: true,
	dts: true,
	clean: true,
	minify: true,
});
