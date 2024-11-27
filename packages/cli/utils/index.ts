import { ImageFormat } from "@image-resizer/tools/constants";
import breakpoints from "@image-resizer/tools/constants/defaults";
import { ImageFormat as IF, SharpInstance } from "@image-resizer/tools/types";
import { convertImageFormat, exportToFile, resizeImage } from "@image-resizer/tools/utils";
import fs from "fs";
import { glob } from "glob";
import path from "path";
const fsp = fs.promises;

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
	const escapedDir = path.normalize(dir).replace(/ /g, "\\ ");
	const pattern = path.join(escapedDir, `**/*.{${imageExts}}`);
	try {
		return glob.sync(pattern, { nodir: true });
	} catch (error) {
		return [];
	}
};
export const createFolder = (folderPath: string) => {
	try {
		if (fs.existsSync(folderPath)) {
		}
		fs.mkdirSync(folderPath, { recursive: true });
	} catch (error) {
		console.log(error);
	}
};

export const asyncCreateFolder = async (folderPath: string) => {
	try {
		if (fs.existsSync(folderPath)) {
			return Promise.resolve(true);
		}
		await fsp.mkdir(folderPath, { recursive: true });
		return Promise.resolve(true);
	} catch (error) {
		console.log(error);
		return Promise.resolve(false);
	}
};

export const _editImage = async (
	imgInstance: SharpInstance,
	imgPath: string,
	inputPath: string,
	outputPath: string,
	height: number,
	width: number,
	bpWidth: number,
	format: IF,
	quality: number
) => {
	try {
		const aspectRatio = width / height;
		if (bpWidth > width) {
			return Promise.reject("Breakpoint width is greater than original image width");
		}
		const resizedInstance = resizeImage(imgInstance, bpWidth, Math.round(bpWidth / aspectRatio));
		const img = convertImageFormat(resizedInstance, format, quality);
		const relativePath = path.dirname(path.relative(inputPath, imgPath));
		const outputDirectory = path.join(outputPath, relativePath);
		await asyncCreateFolder(outputDirectory);
		const fileTitle = path.basename(imgPath, path.extname(imgPath));
		const outputImagePath = `${outputDirectory}/${fileTitle}-${bpWidth}.${format}`;
		return exportToFile(img, outputImagePath);
	} catch (error) {
		console.log(error);
	}
};
