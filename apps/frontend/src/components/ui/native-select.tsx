import { cn } from "@/lib/utils";
import {
	DetailedHTMLProps,
	forwardRef,
	OptionHTMLAttributes,
	SelectHTMLAttributes,
} from "react";
type NativeSelectItem = { children: string } & OptionHTMLAttributes<HTMLOptionElement>;
type Props = DetailedHTMLProps<
	SelectHTMLAttributes<HTMLSelectElement>,
	HTMLSelectElement
> & {
	children: React.ReactNode[] | React.ReactNode;
};
const SelectClassName =
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
const NativeSelect = forwardRef<HTMLSelectElement, Props>(
	({ children, className, multiple, defaultValue, ...others }, ref) => {
		const options = Array.isArray(children) ? children : [children];
		let defValue = undefined;
		if (defaultValue) {
			defValue = multiple
				? Array.isArray(defaultValue)
					? defaultValue
					: [defaultValue]
				: defaultValue;
		}
		return (
			<select
				{...others}
				ref={ref}
				className={cn(SelectClassName, className)}
				multiple={multiple}
				defaultValue={defValue}
			>
				{options}
			</select>
		);
	}
);
NativeSelect.displayName = "NativeSelect";

export const NativeSelectContent = () => {
	return <></>;
};

export const NativeSelectItem = ({ children, ...props }: NativeSelectItem) => {
	return <option {...props}>{children}</option>;
};

export default NativeSelect;
