#!/usr/bin/env bun
import { ImageFormat } from "@image-resizer/tools/constants";
import breakpoints from "@image-resizer/tools/constants/defaults";
import type { ImageFormat as IF } from "@image-resizer/tools/types";
import { getSharpInstance } from "@image-resizer/tools/utils";
import { input, number, select } from "@inquirer/prompts";
import fs from "fs";
import ora from "ora";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { version } from "./package.json";
import { cliArgs } from "./type";
import { _editImage, getBreakpoints, getImages, isExistingDirectory, isValidBpCliArg } from "./utils";
const spinner = ora("Converting Image...");
const argsY = yargs(hideBin(process.argv))
	.usage("Usage: $0 -i [folder] [-o output] [-q quality] [-f format] [-bp breakpoint]")
	.version(version)
	.alias("v", "version")
	.alias("h", "help")
	.option("i", {
		alias: "input",
		describe: "Input directory path",
		type: "string",
	})
	.option("o", {
		alias: "output",
		describe: "Output directory path",
		type: "string",
	})
	.option("q", {
		alias: "quality",
		describe: "Output image quality",
		type: "number",
		default: 85,
	})
	.option("f", {
		alias: "format",
		describe: "Output image format",
		type: "string",
	})
	.option("b", {
		alias: "breakpoint",
		describe: "Breakpoint width",
		type: "string",
	})
	.option("r", {
		alias: "recursive",
		describe: "Recursive",
		type: "boolean",
	})
	.help().argv as cliArgs;

let inputDirectoryPath = argsY.i || "";
let outputDirectoryPath = argsY.o || "";
let format = argsY.f;
let quality: number | undefined = !!argsY?.q ? +argsY.q : 0;
let bp = argsY.b?.toString() || "";

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
				message: "Enter the quality of the image (1-100):",
				default: 85,
				validate: (value) => {
					return (!!value && value > 1 && value <= 100) || "Quality must be between 1 and 100";
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
		const startTime = Date.now();
		const isDirectoryExists = fs.existsSync(outputDirectoryPath);

		if (!isDirectoryExists) {
			fs.mkdirSync(outputDirectoryPath, { recursive: true });
		}
		const dirImagesPath = getImages(inputDirectoryPath);

		const imagePromises = dirImagesPath.map(async (imgPath) => {
			const sharpInstance = getSharpInstance(imgPath);
			const { height = 0, width = 0 } = await sharpInstance.metadata();

			return breakpointArr
				.map((bpWidth) => {
					return _editImage(
						sharpInstance,
						imgPath,
						inputDirectoryPath,
						outputDirectoryPath,
						height,
						width,
						bpWidth,
						format as IF,
						quality as number
					);
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
