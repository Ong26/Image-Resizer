#!/usr/bin/env bun
import { ImageFormat } from "@image-resizer/tools/constants";
import breakpoints from "@image-resizer/tools/constants/defaults";
import type { ImageFormat as IF, SharpInstance } from "@image-resizer/tools/types";
import { convertImageFormat, exportToFile, getSharpInstance, resizeImage } from "@image-resizer/tools/utils";
import { input, number, select } from "@inquirer/prompts";
import fs from "fs";
import ora from "ora";
import os from "os";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { cliArgs } from "./type";
import { getBreakpoints, getImages, isExistingDirectory, isValidBpCliArg } from "./utils";
console.log("hello");
const tempDir = os.tmpdir();
const spinner = ora("Converting Image...");
const argv = yargs(hideBin(process.argv)).argv as cliArgs;
let inputDirectoryPath = argv.i || "";
let inputPath = "";
let outputDirectoryPath = argv.o || "";
let format = argv.f;
let quality: number | undefined = !!argv?.q ? +argv.q : 0;
let bp = argv.bp?.toString() || "";
const startTime = Date.now();
// CLI Logic
(async () => {
	try {
		console.log("Welcome to the Image Batch Converter CLI!\n");
		// Prompt for input file
		if (!isExistingDirectory(inputDirectoryPath))
			inputDirectoryPath = await input({
				message: "Enter the input directory path:",
				validate: (value) => {
					return !!value
						? isExistingDirectory(value) || "Input directory does not exist"
						: "Input directory path cannot be empty";
				},
			});

		// Prompt for output file
		if (!outputDirectoryPath) {
			outputDirectoryPath = await input({
				message: "Enter the folder to save the converted image:",
				validate: (value) => {
					return !!value
						? isExistingDirectory(value) || "Input directory does not exist"
						: "Input directory path cannot be empty";
				},
			});
		}

		const imageFormats = Object.values(ImageFormat);
		// Prompt for format
		if (imageFormats.findIndex((imageFormat) => imageFormat === format) === -1) {
			format = await select({
				message: "Choose the format to convert the image to:",
				choices: Object.values(imageFormats),
			});
		}
		if (!quality) {
			quality = await number({
				message: "Enter the quality of the image (0-1):",
				default: 1,
				validate: (value) => {
					return (!!value && value > 0 && value <= 1) || "Quality must be between 0 and 1";
				},
			});
		}
		let breakpointInquire = "";
		let breakpointArr: number[] = [];

		if (!isValidBpCliArg(bp)) {
			breakpointInquire = await select({
				message: "Select a breakpoint:",
				choices: breakpoints,
			});
		}
		if (breakpointInquire === "custom") {
			const breakpointString = await input({
				message: "Enter custom breakpoints (separate with comma):",
				validate: (value: string) => {
					return !!value || "Custom breakpoint cannot be empty";
				},
			});
			breakpointArr = getBreakpoints(breakpointString);
		} else {
			breakpointArr = getBreakpoints(bp);
		}

		spinner.start();
		const isDirectoryExists = fs.existsSync(outputDirectoryPath);

		if (!isDirectoryExists) {
			fs.mkdirSync(outputDirectoryPath, { recursive: true });
		}
		const dirImagesPath = getImages(inputDirectoryPath);
		const _editImage = async (
			imgInstance: SharpInstance,
			imgPath: string,
			height: number,
			width: number,
			bpWidth: number,
			format: IF,
			quality: number
		) => {
			const aspectRatio = width / height;
			if (bpWidth > width) {
				return Promise.reject("Breakpoint width is greater than original image width");
			}
			const resizedInstance = resizeImage(imgInstance, bpWidth, Math.round(bpWidth / aspectRatio));
			const img = convertImageFormat(resizedInstance, format, quality);

			const fileTitle = path.basename(imgPath, path.extname(inputPath));
			const outputImagePath = `${outputDirectoryPath}/${fileTitle}-${bpWidth}.${format}`;
			return exportToFile(img, outputImagePath);
		};
		const imagePromises = dirImagesPath.map(async (imgPath) => {
			const sharpInstance = getSharpInstance(imgPath);
			const { height = 0, width = 0 } = await sharpInstance.metadata();

			return breakpointArr
				.map((bpWidth) => {
					return _editImage(sharpInstance, imgPath, height, width, bpWidth, format as IF, quality as number);
				})
				.flat();
		});

		await Promise.allSettled(imagePromises);
		spinner.stop();
		const endTime = Date.now();
		const timeTaken = (endTime - startTime) / 1000;
		console.log(`✅ Image successfully converted.`);
		console.log(`📂 Saved to: ${outputDirectoryPath}`);
		console.log(`⏱️ Time taken: ${timeTaken} seconds`);
	} catch (error) {
		spinner.stop();
		console.error(`❌ Error: ${error}`);
	}
})();
