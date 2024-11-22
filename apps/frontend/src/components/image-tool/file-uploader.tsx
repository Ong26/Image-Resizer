import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageFormat, ImageSpec } from "@image-resizer/tools/types";
import { generateId } from "@image-resizer/tools/utils/generate-id";

import React, { Dispatch, SetStateAction } from "react";

type Props = {
	src: string | null;
	file: File | null;
	dimension: { width: number; height: number } | null;
	setSrc: Dispatch<SetStateAction<string | null>>;
	setFile: Dispatch<SetStateAction<File | null>>;
	setDimension: Dispatch<SetStateAction<{ width: number; height: number } | null>>;
	setActiveImageSpec: Dispatch<SetStateAction<ImageSpec | null>>;
};

const FileUploader = ({ setSrc, setFile, setDimension, setActiveImageSpec }: Props) => {
	const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			const fileExtension = file.name.split(".").pop()?.toLowerCase() as ImageFormat;
			setFile(file);

			const objectUrl = URL.createObjectURL(file);

			const image = new Image();
			image.src = objectUrl;

			image.onload = () => {
				const dimension = { width: image.naturalWidth, height: image.naturalHeight };
				setDimension(dimension);
				setActiveImageSpec({
					id: generateId(),
					title: "Untitled",
					coordinate: { x: 0, y: 0 },
					dimension,
					resizeTo: { width: dimension.width, height: dimension.height },
					quality: 1,
					format: fileExtension,
				});

				const reader = new FileReader();
				reader.onload = () => {
					setSrc(reader.result as string);
				};
				reader.readAsDataURL(file);
			};

			image.onerror = () => {
				console.error("Failed to load image");
			};
		}
	};
	return (
		<div>
			<Label htmlFor="image-upload">Upload Image</Label>
			<Input
				id="image-upload"
				type="file"
				accept="image/*"
				onChange={onSelectFile}
				className="mt-1"
			/>
		</div>
	);
};

export default FileUploader;
