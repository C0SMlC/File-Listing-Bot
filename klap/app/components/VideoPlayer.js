"use client";
import React, { useRef, useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import Caption from "./Captions";

const VideoPlayer = ({ videoSrc, caption, captionStyle }) => {
  const videoRef = useRef(null);
  const [currentCaption, setCurrentCaption] = useState("");

  useEffect(() => {
    const video = videoRef.current;

    const updateCaptions = () => {
      const currentTime = video.currentTime;
      const activeCaption = caption.find(
        (cap) =>
          currentTime >= cap.startInSeconds &&
          currentTime < cap.startInSeconds + 1
      );
      setCurrentCaption(activeCaption ? activeCaption.text : "");
    };

    video.addEventListener("timeupdate", updateCaptions);

    return () => {
      video.removeEventListener("timeupdate", updateCaptions);
    };
  }, [caption]);

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding={4}
    >
      <Box width={["100%", "80%", "60%", "40%"]} maxWidth="800px">
        <Box
          width="100%"
          height="0"
          paddingBottom="177.78%"
          position="relative"
          overflow="hidden"
          borderRadius="md"
          boxShadow="lg"
        >
          <video
            ref={videoRef}
            controls
            src={videoSrc}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          >
            Your browser does not support the video tag.
          </video>
          <Caption caption={currentCaption} style={captionStyle} />
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
