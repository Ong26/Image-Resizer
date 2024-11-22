#!/usr/bin/env node
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
import { cliArgs } from "./type";
import { getBreakpoints, isPathValid, isValidBpCliArg } from "./utils";

const tempDir = os.tmpdir();
const spinner = ora("Converting Image...");
const argv = yargs(hideBin(process.argv)).argv as cliArgs;
let inputPath = argv.i || "";
let outputDirectoryPath = argv.o || "";
let format = argv.f;
let quality: number | undefined = !!argv?.q ? +argv.q : 0;
let bp = argv.bp?.toString() || "";
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
		console.log(`✅ Image successfully converted.`);
		console.log(`📂 Saved to: ${outputDirectoryPath}`);
	} catch (error) {
		console.error(`❌ Error: ${error}`);
	}
})();
