#!/bin/bash

# Setup script to download FFmpeg WASM files
# Run this after cloning the repository

echo "📦 Downloading FFmpeg WASM files..."

# Create directory if it doesn't exist
mkdir -p public/ffmpeg

# Download ffmpeg-core.js
echo "Downloading ffmpeg-core.js..."
curl -o public/ffmpeg/ffmpeg-core.js https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js

# Download ffmpeg-core.wasm
echo "Downloading ffmpeg-core.wasm (31MB)..."
curl -o public/ffmpeg/ffmpeg-core.wasm https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm

echo "✅ FFmpeg files downloaded successfully!"
echo "Files located in: public/ffmpeg/"
ls -lh public/ffmpeg/
