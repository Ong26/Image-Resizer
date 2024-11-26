import { ImageFormat } from "@image-resizer/tools/constants";
import breakpoints from "@image-resizer/tools/constants/defaults";
import fs from "fs";
import { glob } from "glob";
import path from "path";
export const isPathValid = (pathStr: string) => {
	return fs.existsSync(pathStr);
};

export const isExistingDirectory = (pathStr: string) => {
	try {
		return fs.lstatSync(pathStr).isDirectory();
	} catch (error) {
		return false;
	}
};

export const getBreakpoints = (bp: string) => {
	const bpts = breakpoints.filter((bpts) => bpts.value !== "custom").find((bpts) => bpts.value === bp)?.breakpoints;
	if (bpts) return bpts;
	const mappedBpWidth = bp.split(",").map((x) => +x.trim());
	const areBptWidthsValid = mappedBpWidth.length > 0 && mappedBpWidth.every((x) => !isNaN(x));
	if (!areBptWidthsValid) return [];
	return mappedBpWidth;
};

export const isValidBpCliArg = (bp: string) => {
	if (!bp) return false;
	const bpValues = breakpoints.map((bp) => bp.value).filter((bp) => bp !== "custom");
	const isDefaultBp = bpValues.includes(bp);
	if (isDefaultBp) return true;
	const mappedBpWidth = bp.split(",").map((x) => +x.trim());
	return mappedBpWidth.length > 0 && mappedBpWidth.every((x) => !isNaN(x));
};

export const getImages = (dir: string): string[] => {
	const imageExts = Object.values(ImageFormat).join(",");
	console.log(imageExts);
	const escapedDir = path.normalize(dir).replace(/ /g, "\\ ");
	console.log(escapedDir);
	const pattern = path.join(escapedDir, `**/*.{${imageExts}}`);
	try {
		return glob.sync(pattern, { nodir: true });
	} catch (error) {
		return [];
	}
};
