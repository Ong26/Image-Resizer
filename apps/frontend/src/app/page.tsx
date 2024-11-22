"use client";

const _imageSpecs: ImageSpec[] = [
	// {
	// 	id: "1",
	// 	title: "Hello test 1",
	// 	coordinate: { x: 0, y: 0 },
	// 	dimension: { width: 1600, height: 900 },
	// 	resizeTo: { width: 1600, height: 900 },
	// 	quality: 1,
	// 	aspectRatio: 1.7777778,
	// 	aspectRatioWithDiv: "16/9",
	// 	format: "webp",
	// },
	// {
	// 	id: "2",
	// 	title: "Hello test 2",
	// 	coordinate: { x: 10, y: 10 },
	// 	dimension: { width: 500, height: 500 },
	// 	resizeTo: { width: 500, height: 500 },
	// 	quality: 0.8,
	// 	aspectRatio: 1,
	// 	aspectRatioWithDiv: "1/1",
	// 	format: "webp",
	// },
];

import FileUploader from "@/components/image-tool/file-uploader";
import ImageSpecForm from "@/components/image-tool/image-spec-form";
import TableSheet from "@/components/table-sheet";
import { Button } from "@/components/ui/button";
import { Dimension, ImageFormat, ImageSpec } from "@image-resizer/tools/types";
import { deepClone } from "@image-resizer/tools/utils/deep-clone";
import { generateId } from "@image-resizer/tools/utils/generate-id";
import { useState } from "react";
import { toast } from "sonner";
export default function Home() {
	const [src, setSrc] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [originalDimension, setOriginalDimension] = useState<Dimension | null>(null);
	const [imageSpecs, setImageSpecs] = useState<ImageSpec[]>(_imageSpecs);
	const [activeImageSpec, setActiveImageSpec] = useState<ImageSpec | null>(null);
	const saveImageSpec = (imageSpec: ImageSpec) => {
		setImageSpecs((prev) => {
			const _clonedPrev = deepClone(prev);
			if (imageSpec.id) {
				const index = _clonedPrev.findIndex((spec) => spec.id === imageSpec.id);
				if (index !== -1) {
					_clonedPrev[index] = imageSpec;
					return _clonedPrev;
				}
				return [...prev, { ...imageSpec, id: generateId() }];
			}
			return [...prev, { ...imageSpec, id: generateId() }];
		});
	};
	const deleteImageSpec = (id: string) => {
		setImageSpecs((prev) => prev.filter((spec) => spec.id !== id));
	};

	const downloadImages = async () => {
		const formData = new FormData();
		if (!file) {
			toast("Please upload an image first");
			return;
		}
		formData.append("image", file);
		formData.append("imageSpecs", JSON.stringify(imageSpecs));
		try {
			const response = await fetch("http://localhost:3000/resizer/upload", {
				method: "POST",
				body: formData,
				// headers: downloadHeaders,
			});

			if (!response.ok) {
				throw new Error("Failed to upload file");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "images.zip";
			link.click();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error uploading file:", error);
		}
	};
	const createImageSpecForm = () => {
		const fileExtension = file?.name.split(".").pop()?.toLowerCase() as ImageFormat;
		if (originalDimension)
			setActiveImageSpec({
				id: generateId(),
				title: "Untitled",
				coordinate: { x: 0, y: 0 },
				dimension: originalDimension,
				resizeTo: originalDimension,
				quality: 1,
				format: fileExtension,
				aspectRatioWithDiv: "Freeform",
			});
	};
	return (
		<div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col">
				<div className="flex flex-col">
					<header className="form-header sticky top-0 bg-slate-100 shadow z-10">
						<div className="px-8 py-4 flex flex-row justify-between items-center">
							<h2>Image Tool</h2>
							<TableSheet
								imageSpecs={imageSpecs}
								setActiveImageSpec={setActiveImageSpec}
								deleteImageSpec={deleteImageSpec}
								downloadImages={downloadImages}
							/>
						</div>
					</header>
					<div className="flex flex-col p-8 pb-20 gap-4">
						<FileUploader
							src={src}
							file={file}
							dimension={originalDimension}
							setDimension={setOriginalDimension}
							setSrc={setSrc}
							setFile={setFile}
							setActiveImageSpec={setActiveImageSpec}
						/>
						{!activeImageSpec && <Button onClick={createImageSpecForm}>Create Image Specification</Button>}

						{src && originalDimension && activeImageSpec && (
							<div className="mt-6">
								<ImageSpecForm
									key={activeImageSpec?.id}
									src={src}
									activeImageSpec={activeImageSpec}
									setActiveImageSpec={setActiveImageSpec}
									saveImageSpec={saveImageSpec}
									originalDimension={originalDimension}
								/>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}
