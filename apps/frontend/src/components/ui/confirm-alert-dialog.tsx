import { cn } from "@/lib/utils";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "./button";

type ConfirmAnswerProps = {
	title: ReactNode;
	description: ReactNode;
	confirmText: string;
	cancelText?: string;
};
export const confirmAnswer = (
	{ title, description, confirmText, cancelText }: ConfirmAnswerProps = {
		title: "",
		description: "",
		confirmText: "OK",
		cancelText: "",
	}
): Promise<boolean> => {
	return new Promise((resolve) => {
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);
		const cleanup = () => {
			root.unmount();
			if (container && container.parentNode) document.body.removeChild(container);
		};

		const ConfirmDialog = () => {
			const [open, setOpen] = useState(true);

			const handleCancel = () => {
				cleanup();
				setOpen(false);
				resolve(false);
			};

			const handleConfirm = () => {
				cleanup();
				setOpen(false);
				resolve(true);
			};

			const onOpenChange = (open: boolean) => {
				if (!open) cleanup();
				setOpen(open);
			};

			return (
				<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
					<AlertDialog.Portal container={container}>
						<AlertDialog.Overlay
							className={cn(
								"fixed inset-0 z-50 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
							)}
						/>
						<AlertDialog.Content
							className={
								"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
							}
						>
							<AlertDialog.Title className={cn("text-lg font-semibold")}>
								{title}
							</AlertDialog.Title>

							{description && (
								<AlertDialog.Description className={cn("text-sm text-muted-foreground")}>
									{description}
								</AlertDialog.Description>
							)}
							<div className="flex justify-end gap-6">
								<AlertDialog.Cancel asChild>
									<Button onClick={handleCancel} type="button" variant={"outline"}>
										{cancelText}
									</Button>
								</AlertDialog.Cancel>

								<AlertDialog.Action asChild>
									<Button onClick={handleConfirm} type="button" variant={"default"}>
										{confirmText}
									</Button>
								</AlertDialog.Action>
							</div>
						</AlertDialog.Content>
					</AlertDialog.Portal>
				</AlertDialog.Root>
			);

			// create portal
			/*
      return createPortal(
				<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
					<AlertDialog.Portal>
						<AlertDialog.Overlay
							className={cn(
								"fixed inset-0 z-50 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
							)}
						/>
						<AlertDialog.Content
							className={
								"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
							}
						>
							<AlertDialog.Title className={cn("text-lg font-semibold")}>
								{title}
							</AlertDialog.Title>

							{description && (
								<AlertDialog.Description className={cn("text-sm text-muted-foreground")}>
									{description}
								</AlertDialog.Description>
							)}
							<div className="flex justify-end gap-6">
								<AlertDialog.Cancel asChild>
									<Button onClick={handleCancel} type="button" variant={"outline"}>
										{cancelText}
									</Button>
								</AlertDialog.Cancel>

								<AlertDialog.Action asChild>
									<Button onClick={handleConfirm} type="button" variant={"default"}>
										{confirmText}
									</Button>
								</AlertDialog.Action>
							</div>
						</AlertDialog.Content>
					</AlertDialog.Portal>
				</AlertDialog.Root>,
				container
			);
		};
      */
		};

		root.render(<ConfirmDialog />);
	});
};
