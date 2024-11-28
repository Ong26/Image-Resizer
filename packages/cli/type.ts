import { ImageFormat } from "@image-resizer/tools/types";

export type cliArgs = {
	//breakpoints
	b?: string;
	//input file
	i?: string;

	//output directory path
	o?: string;

	//format
	f?: ImageFormat;

	//quality
	q?: string;

	//recursive
	r?: boolean;

	//inquirer prompt
	p?: boolean;
};
