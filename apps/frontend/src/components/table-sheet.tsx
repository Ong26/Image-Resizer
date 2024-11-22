import { Button } from "@/components/ui/button";
import { confirmAnswer } from "@/components/ui/confirm-alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ImageSpec } from "@image-resizer/tools/types";
import { ListChecksIcon, MoreHorizontalIcon, Pencil, Plus, Trash } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

type Props = {
	imageSpecs: ImageSpec[];
	setActiveImageSpec: Dispatch<SetStateAction<ImageSpec | null>>;
	deleteImageSpec: (id: string) => void;
	downloadImages: () => void;
};
const cellClass = "border-b border-slate-700 py-2 text-left";

const TableSheet = ({ imageSpecs, setActiveImageSpec, deleteImageSpec, downloadImages }: Props) => {
	const [isOpened, setIsOpened] = useState(false);
	const onDeleteClick = (id: string) => {
		return async () => {
			const ans = await confirmAnswer({
				title: "Delete this image specification?",
				description: "This action cannot be undone.",
				confirmText: "Delete",
				cancelText: "Cancel",
			});
			if (ans) deleteImageSpec(id);
		};
	};
	const onEditClick = (id: string) => {
		return () => {
			const imageSpec = imageSpecs.find((spec) => spec.id === id);
			if (imageSpec) setActiveImageSpec(imageSpec);
			setIsOpened(false);
		};
	};
	const onOpenChange = (val: boolean) => setIsOpened(val);

	return (
		<Sheet open={isOpened} onOpenChange={onOpenChange}>
			<SheetTrigger>
				<ListChecksIcon />
			</SheetTrigger>
			<SheetContent className="w-4/5 flex flex-col pb-4">
				<SheetHeader>
					<SheetTitle>Image Specifcations</SheetTitle>
					<SheetDescription>List of added specifications</SheetDescription>
				</SheetHeader>
				<table className="table-auto w-full mt-4">
					<thead>
						<tr>
							<th className={cellClass}>Title</th>
							<th className={cellClass}>Starting Point</th>
							<th className={cellClass}>Dimension</th>
							<th className={cellClass}>A/R</th>
							<th className={cellClass}> Quality </th>
							<th className={cellClass}> Format </th>

							<th className={cellClass}></th>
						</tr>
					</thead>
					<tbody>
						{imageSpecs.map((imageSpec) => {
							return (
								<tr key={imageSpec.id} className="">
									<td className={cellClass}>{imageSpec.title}</td>
									<td className={cellClass}>
										({Math.round(imageSpec.coordinate.x)}, {Math.round(imageSpec.coordinate.y)})
									</td>

									<td className={cellClass}>
										<div className="flex flex-row items-center justify-center w-fit">
											{imageSpec.resizeTo.width} <Plus className="rotate-45" size={14} />
											{imageSpec.resizeTo.height}
										</div>
									</td>
									<td className={cellClass}> {imageSpec.aspectRatio || "-"}</td>
									<td className={cellClass}> {imageSpec.quality}</td>
									<td className={cellClass}> {imageSpec.format}</td>

									<td className={cellClass}>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<MoreHorizontalIcon className="text-slate-500" />
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-56">
												<DropdownMenuLabel>Action</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuGroup>
													<DropdownMenuItem accessKey="E" onClick={onEditClick(imageSpec.id!)}>
														<Pencil className="mr-2 h-4 w-4" />
														<span>Edit</span>
														<DropdownMenuShortcut>⌘ ⌥ E</DropdownMenuShortcut>
													</DropdownMenuItem>
													<DropdownMenuItem accessKey="X" onClick={onDeleteClick(imageSpec.id!)}>
														<Trash className="mr-2 h-4 w-4 text-red-500" />
														<span className="text-red-500">Delete</span>
														<DropdownMenuShortcut>⌘ ⌥ X</DropdownMenuShortcut>
													</DropdownMenuItem>
												</DropdownMenuGroup>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<div className="flex flex-row mt-auto gap-x-4 justify-end" onClick={() => setIsOpened(false)}>
					<Button type="button" size={"lg"} variant={"outline"}>
						Cancel
					</Button>
					<Button onClick={downloadImages} type="button" size="lg">
						Download All
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default TableSheet;
