"use client";
import { ImageCropper } from "@/components/image-tool/cropper";
import FileUploader from "@/components/image-tool/file-uploader";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
	const [src, setSrc] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [originalDimension, setOriginalDimension] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const submitForm = (formData: FormData) => {
		const formKeysLength = Array.from(formData.keys()).length;
		console.log(formKeysLength);
		console.log(formData.get("width"));
	};
	return (
		<div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col">
				<form className="flex flex-col" action={submitForm}>
					<header className="form-header sticky top-0 bg-slate-100 shadow z-10">
						<div className="px-8 py-4 flex flex-row justify-between items-center">
							<h2>Image Tool</h2>
							<Button variant="default" size="sm" type="submit">
								Download All
							</Button>
						</div>
					</header>
					<div className="flex flex-col p-8 pb-20 gap-16">
						<FileUploader
							src={src}
							file={file}
							dimension={originalDimension}
							setDimension={setOriginalDimension}
							setSrc={setSrc}
							setFile={setFile}
						/>
						{src && originalDimension && (
							<div className="workspace flex flex-col w-full h-full">
								<ImageCropper src={src} dimension={originalDimension} key={src} />
							</div>
						)}
					</div>
				</form>
			</main>
		</div>
	);
}
