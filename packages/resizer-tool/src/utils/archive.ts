import archiver from "archiver";
import { getNewFileName } from ".";
import { BufferWithMetadata } from "../types";
export const archiveImages = async (buffersWithMetadata: BufferWithMetadata[], pipe?: any) => {
	const archive = archiver("zip", { zlib: { level: 9 } });
	archive.on("error", (err: unknown) => {
		throw err;
	});
	if (pipe) archive.pipe(pipe);
	buffersWithMetadata.forEach((bufferWithMetadata, idx) => {
		archive.append(bufferWithMetadata.buffer, {
			name: getNewFileName(bufferWithMetadata.metadata),
		});
	});
	await archive.finalize();
};
