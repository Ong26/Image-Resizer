import path from "path";
import sharp from "sharp";

import { Coordinate, Dimension, ImageSpec, type ImageFormat } from "../types";
type ValidateResult = {
	result: boolean;
	messsage?: string;
};

export const getImageDimension = async (buffer: Buffer) => {
	const { width, height } = await sharp(buffer).metadata();
	return { width, height };
};

export const getNewFileName = (imageSpec: ImageSpec) => {
	const title = (imageSpec?.title || "").replace(/ /g, "_");
	const format = imageSpec.format;
	const dimension = `${imageSpec.resizeTo.width}x${imageSpec.resizeTo.height}`;
	return `${title}_${dimension}.${format}`;
};
export const validateImageSpec = (
	coordinate: Coordinate,
	dimension: Dimension,
	resizeTo: Dimension,
	originalDimension: Dimension
): ValidateResult => {
	if (resizeTo.width > originalDimension.width || resizeTo.height > originalDimension.height) {
		return {
			result: false,
			messsage: "Resize dimension is greater than original dimension",
		};
	}
	if (coordinate.x < 0 || coordinate.y < 0) {
		return {
			result: false,
			messsage: "Coordinate value cannot be negative",
		};
	}
	if (dimension.width < 0 || dimension.height < 0) {
		return {
			result: false,
			messsage: "Dimension value cannot be negative",
		};
	}
	if (resizeTo.width > originalDimension.width || resizeTo.height > originalDimension.height) {
		return {
			result: false,
			messsage: "Resize dimension is greater than original dimension",
		};
	}
	const width = coordinate.x + dimension.width;
	const height = coordinate.y + dimension.height;
	if (width > originalDimension.width || height > originalDimension.height) {
		return {
			result: false,
			messsage: "Coordinate and dimension exceed original dimension",
		};
	}
	return {
		messsage: "",
		result: true,
	};
};
export const getSharpInstance = (buffer: Buffer | string) => {
	return sharp(buffer);
};
export const sharpToBuffer = async (sharpInstance: sharp.Sharp) => {
	return sharpInstance.toBuffer();
};

export const cropImage = (sharpInstance: sharp.Sharp, coordinate: Coordinate, dimension: Dimension) => {
	return sharpInstance.extract({
		left: Math.round(coordinate.x),
		top: Math.round(coordinate.y),
		width: Math.round(dimension.width),
		height: Math.round(dimension.height),
	});
};
export const resizeImage = (sharpInstance: sharp.Sharp, width: number, height: number) => {
	return sharpInstance.resize({ width, height });
};
export const convertImageFormat = (sharpInstance: sharp.Sharp, format: ImageFormat, quality = 1) => {
	quality = quality * 100;
	quality = quality > 100 ? 100 : quality < 0 ? 0 : quality;
	switch (format) {
		case "png":
			return sharpInstance.png({ quality });
		case "jpg":
			return sharpInstance.jpeg({ quality });
		case "webp":
			return sharpInstance.webp({ quality });
		case "avif":
		default:
			return sharpInstance.avif({ quality });
	}
};

export const exportToFile = (sharpInstance: sharp.Sharp, outputPath: string) => {
	return sharpInstance.toFile(outputPath);
};

export const getFileTitleFromPath = (inputPath: string) => {
	return path.basename(inputPath, path.extname(inputPath));
};
