/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui//button";
import { Input } from "@/components/ui//input";
import NativeSelect, { NativeSelectItem } from "@/components/ui//native-select";
import { useCallback, useMemo, useRef, useState } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type Props = { src: string; dimension: { width: number; height: number } };

export const ImageCropper = ({ src, dimension }: Props) => {
	const [ratio, setRatio] = useState(1);
	const heightRef = useRef<HTMLInputElement | null>(null);
	const widthRef = useRef<HTMLInputElement | null>(null);
	const qualityRef = useRef<HTMLInputElement | null>(null);
	const formatRef = useRef<HTMLSelectElement | null>(null);

	const [crop, setCrop] = useState<Crop>({
		x: 0,
		y: 0,
		width: dimension.width,
		height: dimension.height,
		unit: "px",
	});
	const imageRef = useRef<HTMLImageElement | null>(null);
	const cropData = useMemo(() => {
		if (!crop || !imageRef.current) {
			return {
				x: 0,
				y: 0,
				width: dimension.width,
				height: dimension.height,
			};
		}
		const { width } = imageRef.current;
		const ratio = dimension.width / width;

		const { x, y, width: w, height: h } = crop;
		return {
			x: x * ratio,
			y: y * ratio,
			width: w * ratio,
			height: h * ratio,
		};
	}, [crop, dimension.width, dimension.height]);
	const onImageLoaded = useCallback(
		(img: HTMLImageElement) => {
			imageRef.current = img;
			const { width, height } = img;
			const crop = centerCrop(
				makeAspectCrop({ unit: "px", width: width }, width / height, width, height),
				width,
				height
			);
			setRatio(dimension.width / width);
			setCrop({ ...crop, x: 0, y: 0 });
		},
		[dimension.width]
	);
	const downloadImage = () => {
		const w = widthRef.current?.value;
		const h = heightRef.current?.value;
		const q = qualityRef.current!.value;
		const wMax = widthRef.current?.max || dimension.width;
		const hMax = heightRef.current?.max || dimension.height;
		const wMin = widthRef.current?.min || 1;
		const hMin = heightRef.current?.min || 1;
		if (!!w && (+w > +wMax || +w < +wMin)) {
			alert(`Width should be between ${wMin} and ${wMax}`);
			return;
		}
		if (!!h && (+h > +hMax || +h < +hMin)) {
			alert(`Height should be between ${hMin} and ${hMax}`);
			return;
		}
		if (+q < 0.01) {
			alert("Quality should be greater than 0.01");
			return;
		}
		console.log(formatRef.current?.value);
	};
	if (!src) return <></>;
	return (
		<div className="flex flex-col mx-auto space-y-6">
			<div>
				<ReactCrop crop={crop} onChange={setCrop} minWidth={10} minHeight={10}>
					<img src={src} onLoad={(e) => onImageLoaded(e.currentTarget)} alt="Upload" />
				</ReactCrop>
			</div>
			<div className="bg-slate-200 p-4 rounded">
				<pre>{JSON.stringify(cropData, null, 2)}</pre>
			</div>
			<div className="resize flex flex-col">
				<h3>Resize (Width * Height)</h3>
				<div className="flex flex-row flex-1 gap-x-4">
					<Input
						id="width"
						ref={widthRef}
						placeholder="Width"
						type="number"
						name="width"
						max={crop.width * ratio}
						min={1}
					/>
					<Input
						id="height"
						ref={heightRef}
						placeholder="Height"
						name="height"
						type="number"
						max={crop.height * ratio}
						min={1}
					/>
				</div>
			</div>
			<div className="flex flex-row flex-1 gap-x-4">
				<div className="quality flex flex-col w-full">
					<h3>Quality</h3>
					<div className="flex flex-row">
						<Input id="quality" type="number" ref={qualityRef} defaultValue={1} />
					</div>
				</div>
				<div className="format flex flex-col w-full">
					<h3>Format</h3>
					<div className="flex flex-row">
						<NativeSelect multiple ref={formatRef} defaultValue={"png"}>
							<NativeSelectItem value="png">PNG</NativeSelectItem>
							<NativeSelectItem value="jpg">JPG</NativeSelectItem>
							<NativeSelectItem value="avif">AVIF</NativeSelectItem>
							<NativeSelectItem value="jpg">PDF</NativeSelectItem>
						</NativeSelect>
					</div>
				</div>
			</div>

			<Button type="button" variant={"outline"} onClick={downloadImage}>
				Download Single Image
			</Button>
		</div>
	);
};
