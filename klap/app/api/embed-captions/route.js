import { NextResponse } from "next/server";
import { join } from "path";
import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import ffmpegStatic from "ffmpeg-static";

const execFileAsync = promisify(execFile);

export async function POST(request) {
  const { videoSrc, captions } = await request.json();

  if (!videoSrc || !captions) {
    return NextResponse.json(
      { message: "Missing videoSrc or captions" },
      { status: 400 }
    );
  }

  try {
    const publicDir = join(process.cwd(), "public");
    const inputVideoPath = join(publicDir, videoSrc);
    const outputFilename = `output_${Date.now()}.mp4`;
    const outputPath = join(publicDir, outputFilename);
    const captionsPath = join(publicDir, `caption_${Date.now()}.srt`);

    // Check if input video exists
    try {
      await fs.access(inputVideoPath);
    } catch (error) {
      console.error("Input video file not found:", inputVideoPath);
      return NextResponse.json(
        { message: "Input video file not found", error: error.message },
        { status: 400 }
      );
    }

    // Write captions to SRT file
    const srtContent = formatCaptionsToSRT(captions);
    await fs.writeFile(captionsPath, srtContent);

    console.log("SRT file written to:", captionsPath);

    // Log the contents of the SRT file for debugging
    const srtFileContents = await fs.readFile(captionsPath, "utf-8");
    console.log("SRT file contents:", srtFileContents);

    const args = [
      "-i",
      inputVideoPath,
      "-i",
      captionsPath,
      "-c:v",
      "libx264",
      "-c:a",
      "copy",
      "-c:s",
      "mov_text",
      "-metadata:s:s:0",
      "language=eng",
      "-y",
      outputPath,
    ];

    console.log("FFmpeg command:", ffmpegStatic, args.join(" "));

    const { stdout, stderr } = await execFileAsync(ffmpegStatic, args);
    console.log("FFmpeg stdout:", stdout);
    console.log("FFmpeg stderr:", stderr);

    return NextResponse.json({
      embeddedVideoPath: `/${outputFilename}`,
      captionsPath: `/${captionsPath.split("\\").pop()}`,
    });
  } catch (error) {
    console.error("Error processing video:", error);
    return NextResponse.json(
      {
        message: "Error processing video",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

function formatCaptionsToSRT(captions) {
  let srt = "";
  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i];
    const start = formatTime(caption.start);
    const end = formatTime(caption.start + caption.duration);
    srt += `${i + 1}\n${start} --> ${end}\n${caption.text}`;

    if (i < captions.length - 1) {
      srt += "\n";
    }
  }
  return srt;
}

function formatTime(seconds) {
  const date = new Date(seconds * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const secs = date.getUTCSeconds().toString().padStart(2, "0");
  const ms = date.getUTCMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${secs},${ms}`;
}
