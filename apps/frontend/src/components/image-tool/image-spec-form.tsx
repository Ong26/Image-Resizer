/* eslint-disable @next/next/no-img-element */
// TODO implement DPR image
import { AspectRatioList } from "@image-resizer/tools/constants";
import {
	type AspectRatio,
	type Dimension,
	type ImageFormat,
	type ImageSpec,
} from "@image-resizer/tools/types";
import { generateId } from "@image-resizer/tools/utils/generate-id";

import { Button } from "@/components/ui//button";
import { Input } from "@/components/ui//input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui//select";
import {
	ChangeEvent,
	Dispatch,
	FormEvent,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toast } from "sonner";

type Props = {
	src: string;
	originalDimension: Dimension;
	activeImageSpec: ImageSpec;
	setActiveImageSpec: Dispatch<SetStateAction<ImageSpec | null>>;
	saveImageSpec: (imageSpec: ImageSpec) => void;
};

const ImageSpecForm = ({
	src,
	originalDimension,
	activeImageSpec,
	setActiveImageSpec,
	saveImageSpec,
}: Props) => {
	const originalRatio =
		activeImageSpec?.aspectRatio ||
		activeImageSpec.resizeTo.width / activeImageSpec.resizeTo.height;
	const imageRef = useRef<HTMLImageElement | null>(null);

	const [ratioToOriginalSize, setRatioToOriginalSize] = useState(1);

	const [title, setTitle] = useState(activeImageSpec.title || "");
	const [aspectRatioSelectValue, setAspectRatioSelectValue] = useState(() => {
		const aspectRatio = AspectRatioList.find(
			(ratio) => ratio === activeImageSpec.aspectRatioWithDiv
		);
		return (aspectRatio || "Freeform") as string;
	});
	const [cropAspect, setCropAspect] = useState<number | undefined>(
		activeImageSpec.aspectRatio
	);
	const [customAspectRatio, setCustomAspectRatio] =
		useState<Dimension>(originalDimension);
	const [width, setWidth] = useState<number>(activeImageSpec.resizeTo.width);
	const [height, setHeight] = useState<number>(activeImageSpec.resizeTo.height);
	const [format, setFormat] = useState<ImageFormat>(activeImageSpec.format);
	const [quality, setQuality] = useState(1);
	const toRatioValue = useCallback(
		(value: number) => {
			return value / ratioToOriginalSize;
		},
		[ratioToOriginalSize]
	);
	const getCropInfo = (aspectRatio: number) => {
		const cropInfo = centerCrop(
			makeAspectCrop(
				{ unit: "px", width: originalDimension.width },
				aspectRatio,
				toRatioValue(originalDimension.width),
				toRatioValue(originalDimension.height)
			),
			toRatioValue(originalDimension.width),
			toRatioValue(originalDimension.height)
		);
		return { ...cropInfo, x: 0, y: 0 };
	};
	const [crop, setCrop] = useState<Crop>();

	useEffect(() => {
		if (imageRef?.current?.height) {
			const cropInfo: Crop = {
				unit: "px",
				width: toRatioValue(activeImageSpec.dimension.width),
				height: toRatioValue(activeImageSpec.dimension.height),
				x: toRatioValue(activeImageSpec.coordinate.x),
				y: toRatioValue(activeImageSpec.coordinate.y),
			};
			setCrop(cropInfo);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [imageRef?.current?.width, ratioToOriginalSize]);

	const onAspectRatioSelectValueChange = (value: string) => {
		let _aspectRatio: AspectRatio = 1;
		setAspectRatioSelectValue(value);

		if (value === "Freeform") {
			_aspectRatio = originalRatio;
			setCropAspect(undefined);
		} else if (value === "Custom") {
			_aspectRatio = customAspectRatio.width / customAspectRatio.height;
			setCropAspect(_aspectRatio);
		} else {
			const [_width, _height] = (value as string).split("/").map((v) => +v);
			_aspectRatio = _width / _height;
			setCropAspect(_aspectRatio);
		}
		const cropInfo = getCropInfo(_aspectRatio);
		console.log("cropInfo", cropInfo);
		setCrop(cropInfo);
	};

	const onCustomAspectRatioChange = (type: "height" | "width") => {
		return (event: React.ChangeEvent<HTMLInputElement>) => {
			const value = +event.target.value;
			setCustomAspectRatio({ ...customAspectRatio, [type]: value });
			const size = { ...customAspectRatio, [type]: value };
			const aspectRatio = size.width / size.height;
			const cropInfo = getCropInfo(aspectRatio);
			setCropAspect(aspectRatio);
			setCrop(cropInfo);
		};
	};

	const onFormatChange = (value: ImageFormat) => setFormat(value);
	const cropData = useMemo(() => {
		if (!!crop && !!imageRef.current) {
			const { width } = imageRef.current;
			const ratio = originalDimension.width / width;
			const { x, y, width: w, height: h } = crop;
			return {
				x: Math.max(x * ratio, 0),
				y: Math.max(y * ratio, 0),
				width: Math.floor(w * ratio),
				height: Math.floor(h * ratio),
			};
		}

		return {
			x: 0,
			y: 0,
			width: originalDimension.width,
			height: originalDimension.height,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [crop, originalDimension.width, originalDimension.height, imageRef?.current?.width]);
	const onResizeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
		const value = +event.target.value;
		setWidth(value);
		setHeight(Math.floor((value / (crop?.width || 1)) * (crop?.height || 1)));
	};

	const onImageLoaded = useCallback(
		(e: ChangeEvent<HTMLImageElement>) => {
			const img = e.currentTarget;
			imageRef.current = img;
			const { width } = img;
			setRatioToOriginalSize(originalDimension.width / width);
		},
		[originalDimension.width]
	);
	const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
		e?.preventDefault();
		const imageSpec: ImageSpec = {
			id: activeImageSpec.id || generateId(),
			title,
			resizeTo: { width, height },
			coordinate: { x: cropData.x, y: cropData.y },
			dimension: { width: cropData.width, height: cropData.height },
			quality,
			format,
			aspectRatio: cropAspect,
		};
		console.log(imageSpec);
		saveImageSpec(imageSpec);
		setActiveImageSpec(null);
		toast("Image Specification Saved");
	};
	const onQualityChange = (event: ChangeEvent<HTMLInputElement>) =>
		setQuality(+event.target.value);

	const cancelAdd = () => {
		setActiveImageSpec(null);
	};

	return (
		<form className="flex flex-col" onSubmit={onFormSubmit}>
			<div className="grid grid-cols-2 gap-4">
				<div className="col-span-2">
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Title"
						name="title"
						min={1}
						className="text-xl mb-4"
					/>
				</div>
				<div className="flex flex-col">
					<label>Crop Aspect Ratio</label>
					<Select
						onValueChange={onAspectRatioSelectValueChange}
						value={aspectRatioSelectValue as string}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Custom" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{AspectRatioList.map((ratio) => (
									<SelectItem key={ratio} value={ratio}>
										{ratio}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				<div className="flex flex-col">
					{aspectRatioSelectValue === "Custom" && (
						<>
							<label>Custom Aspect Ratio</label>
							<div className="flex flex-row items-center gap-x-2">
								<Input
									onChange={onCustomAspectRatioChange("width")}
									value={customAspectRatio.width}
									placeholder="Width"
									name="aspect-ratio"
									type="number"
									min={1}
									disabled={aspectRatioSelectValue !== "Custom"}
								/>
								<span>:</span>
								<Input
									value={customAspectRatio.height}
									onChange={onCustomAspectRatioChange("height")}
									placeholder="Height"
									name="aspect-ratio"
									type="number"
									min={1}
									disabled={aspectRatioSelectValue !== "Custom"}
								/>
							</div>
						</>
					)}
				</div>
				<div className="col-span-2">
					<ReactCrop
						crop={crop}
						onChange={setCrop}
						minWidth={10}
						minHeight={10}
						aspect={cropAspect}
					>
						<img ref={imageRef} src={src} onLoad={onImageLoaded} alt="Upload" />
					</ReactCrop>
				</div>
				<div className="col-span-2">
					<div className="p-4 bg-slate-200">
						<pre>{JSON.stringify(cropData, null, 2)}</pre>
					</div>
				</div>
				<div className="flex flex-col">
					<label>Format</label>
					<Select onValueChange={onFormatChange} value={format}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="PNG" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="png">PNG</SelectItem>
								<SelectItem value="jpg">JPG</SelectItem>
								<SelectItem value="avif">AVIF</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				<div className="flex flex-col">
					<label>Quality</label>
					<Input
						id="quality"
						placeholder="Quality"
						name="quality"
						type="number"
						value={quality}
						onChange={onQualityChange}
						min={0.1}
						step={0.1}
						max={1.0}
					/>
				</div>
				<div className="flex flex-col">
					<label>Width</label>
					<Input
						id="width"
						value={width}
						onChange={onResizeWidthChange}
						placeholder="Width"
						name="width"
						type="number"
						max={Math.floor(ratioToOriginalSize * (crop?.width || 1))}
						min={1}
					/>
					<label htmlFor="" className="text-slate-600 text-sm">
						Max width: {Math.floor(ratioToOriginalSize * (crop?.width || 1))}px
					</label>
				</div>
				<div className="flex flex-col">
					<label>Height</label>
					<Input
						value={height}
						id="height"
						placeholder="Height"
						name="height"
						type="number"
						min={1}
						className="read-only:bg-slate-100"
						readOnly
					/>
				</div>
				<div className="col-span-2">
					<div className="flex flex-row gap-x-2">
						<Button type="submit" variant="default" size="sm">
							Save
						</Button>

						<Button type="button" onClick={cancelAdd} variant="outline" size="sm">
							Cancel
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
};

export default ImageSpecForm;
