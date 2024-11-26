#!/usr/bin/env bun
import { ImageFormat } from "@image-resizer/tools/constants";
import breakpoints from "@image-resizer/tools/constants/defaults";
import type { ImageFormat as IF } from "@image-resizer/tools/types";
import { convertImageFormat, exportToFile, getSharpInstance, resizeImage } from "@image-resizer/tools/utils";
import { input, number, select } from "@inquirer/prompts";
import fs from "fs";
import ora from "ora";
import os from "os";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { version } from "./package.json";
import { cliArgs } from "./type";
import { getBreakpoints, isPathValid, isValidBpCliArg } from "./utils";

const tempDir = os.tmpdir();
const spinner = ora("Converting Image...");
const argsY = yargs(hideBin(process.argv))
	.usage("Usage: $0 -i [file] [-o output] [-q quality] [-f format] [-bp breakpoint]")
	.version(version)
	.alias("v", "version")
	.alias("h", "help")
	.option("i", {
		alias: "input",
		describe: "Input image path",
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
	.help().argv as cliArgs;
let inputPath = argsY.i || "";
let outputDirectoryPath = argsY.o || "";
let format = argsY.f;
let quality: number | undefined = !!argsY?.q ? +argsY.q : 0;
let bp = argsY.b?.toString() || "";

// CLI Logic
(async () => {
	try {
		console.log("Welcome to the Image Converter CLI!\n");
		// Prompt for input file
		if (!isPathValid(inputPath))
			inputPath = await input({
				message: "Enter the path to the input image:",
				default: "./input/index.jpg",
				validate: (value) => {
					return !!value ? isPathValid(value) || "Input file does not exist" : "Input file path cannot be empty";
				},
			});

		// Prompt for output file
		if (!outputDirectoryPath) {
			outputDirectoryPath = await input({
				message: "Enter the folder to save the converted image:",
				validate: (value: string) => (value ? true : "Output file path cannot be empty"),
			});
		}

		//can only save to temp directory
		if (!isPathValid(outputDirectoryPath)) {
			outputDirectoryPath = path.join(tempDir, "image-resizer-cli", outputDirectoryPath);
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
				default: 100,
				validate: (value) => {
					return (!!value && value > 1 && value <= 100) || "Quality must be between 0 and 1";
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
		const sharpInstance = getSharpInstance(inputPath);
		const { height = 0, width = 0 } = await sharpInstance.metadata();
		const _editImage = async (bpWidth: number, format: IF, quality: number) => {
			const sharpInstance = getSharpInstance(inputPath);
			const aspectRatio = width / height;
			if (bpWidth > width) {
				return Promise.reject("Breakpoint width is greater than original image width");
			}
			const resizedInstance = resizeImage(sharpInstance, bpWidth, Math.round(bpWidth / aspectRatio));
			const img = convertImageFormat(resizedInstance, format, quality);

			const fileTitle = path.basename(inputPath, path.extname(inputPath));
			const outputImagePath = `${outputDirectoryPath}/${fileTitle}-${bpWidth}.${format}`;
			return exportToFile(img, outputImagePath);
		};
		const editPromises = breakpointArr.map((bpWidth) => {
			return _editImage(bpWidth, format as IF, quality as number);
		});
		await Promise.allSettled(editPromises);
		spinner.stop();
		const endTime = Date.now();
		const timeTaken = (endTime - startTime) / 1000;
		console.log(`✅Image successfully converted.`);
		console.log(`📂Saved to: ${outputDirectoryPath}`);
		console.log(`⏱️Time taken: ${timeTaken} seconds`);
	} catch (error) {
		console.error(`❌ Error: ${error}`);
	}
})();
