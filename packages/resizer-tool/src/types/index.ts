import sharp from "sharp";

export type ImageFormat = "png" | "jpg" | "webp" | "avif";
export type ImageSpec = {
	id?: string;
	title: string;
	coordinate: { x: number; y: number };
	dimension: { width: number; height: number };
	resizeTo: { width: number; height: number };
	quality: number;
	format: ImageFormat;
	aspectRatio?: number;
	aspectRatioWithDiv?: AspectRatio;
};
export type Coordinate = { x: number; y: number };
export type Dimension = { width: number; height: number };
export type IsAspectRatioLocked = boolean;
export type AspectRatio = `${number}/${number}` | number | "1/1" | "4/3" | "16/9" | "Custom" | "Freeform";
export type BufferWithMetadata = { buffer: Buffer; metadata: ImageSpec };
export type SharpInstance = sharp.Sharp;
