# Image Resizer CLI

This project provides CLI tools for batch and single image resizing and format conversion using Sharp.

## Installation

1. Install dependencies:
   ```sh
   pnpm install
   ```

## Usage

### Batch Image Resizer

The batch image resizer allows you to resize and convert multiple images in a directory.

#### Command

```sh
bun batch.ts -i <input_directory> -o <output_directory> -f <format> -q <quality> -bp <breakpoints>
```

## Build
