"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast,
} from "@chakra-ui/react";
import VideoPlayer from "../components/VideoPlayer";

const VideoEditor = () => {
  const [activeTab, setActiveTab] = useState("style");
  const [videoSrc, setVideoSrc] = useState("Before.mp4");
  const [caption, setCaption] = useState(null);
  const [captionStyle, setCaptionStyle] = useState({
    font: "Montserrat",
    weight: "Black",
    color: "white",
    position: 20,
    size: 8,
    display: "Displayed",
    animation: "No Animation",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);
  const [captionFilePath, setCaptionFilePath] = useState(
    "./short_transcription_file.json"
  ); // Store path

  const toast = useToast();

  const updateCaptionStyle = (key, value) => {
    setCaptionStyle((prevStyle) => ({
      ...prevStyle,
      [key]: value,
    }));
  };

  const fetchCaptions = async () => {
    try {
      const response = await fetch(captionFilePath);
      if (!response.ok) throw new Error("Failed to fetch captions");

      const data = await response.json();
      // Map the transcription to the desired format for the caption state
      const formattedCaptions = data.transcription.map((item) => ({
        start: item.startInSeconds,
        text: item.text,
      }));

      setCaption(formattedCaptions);
    } catch (error) {
      console.error("Error fetching captions:", error);
      toast({
        title: "Error fetching captions",
        description: error.message || "Failed to load captions.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEmbedCaptions = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/embed-captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoSrc,
          captions: caption,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process video");
      }

      const data = await response.json();
      setDownloadLink(data.embeddedVideoPath);
      toast({
        title: "Video processed successfully",
        description: "Your video with embedded captions is ready for download.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error embedding captions:", error);
      toast({
        title: "Error processing video",
        description:
          error.message ||
          "There was an error embedding the captions. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchCaptions();
  }, [captionFilePath]);

  return (
    <Box bg="gray.900" minH="100vh" color="white">
      <HStack spacing={8} p={8} align="start">
        <VStack spacing={4} align="stretch" flex={1}>
          {activeTab === "style" && (
            <>
              <Text fontWeight="bold">Captions</Text>
              <Select
                placeholder="Font"
                bg="gray.700"
                value={captionStyle.font}
                onChange={(e) => updateCaptionStyle("font", e.target.value)}
              >
                <option>Montserrat</option>
                {/* Add more font options */}
              </Select>
              <Select
                placeholder="Weight"
                bg="gray.700"
                value={captionStyle.weight}
                onChange={(e) => updateCaptionStyle("weight", e.target.value)}
              >
                <option>Black</option>
                {/* Add more weight options */}
              </Select>
              <HStack>
                <Button>AA</Button>
                <Button>Aa</Button>
              </HStack>
              <Text fontWeight="bold">Fill</Text>
              <HStack>
                {[
                  "white",
                  "black",
                  "red",
                  "yellow",
                  "green",
                  "blue",
                  "purple",
                ].map((color) => (
                  <Button
                    key={color}
                    bg={color}
                    w={8}
                    h={8}
                    borderRadius="full"
                    onClick={() => updateCaptionStyle("color", color)}
                  />
                ))}
              </HStack>
              <Text fontWeight="bold">Position</Text>
              <Slider
                value={captionStyle.position}
                onChange={(value) => updateCaptionStyle("position", value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text fontWeight="bold">Size</Text>
              <Slider
                value={captionStyle.size}
                onChange={(value) => updateCaptionStyle("size", value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text fontWeight="bold">Display</Text>
              <HStack>
                {["Displayed", "Lines", "Words"].map((option) => (
                  <Button
                    key={option}
                    variant={
                      captionStyle.display === option ? "solid" : "outline"
                    }
                    color="white"
                    onClick={() => updateCaptionStyle("display", option)}
                  >
                    {option}
                  </Button>
                ))}
              </HStack>
              <Text fontWeight="bold" color="white">
                Animation
              </Text>
              <HStack>
                {["No Animation", "Spring"].map((option) => (
                  <Button
                    key={option}
                    variant={
                      captionStyle.animation === option ? "solid" : "outline"
                    }
                    color="white"
                    onClick={() => updateCaptionStyle("animation", option)}
                  >
                    {option}
                  </Button>
                ))}
              </HStack>
            </>
          )}

          <Button
            colorScheme="blue"
            onClick={handleEmbedCaptions}
            isLoading={isProcessing}
            loadingText="Processing..."
          >
            Embed Captions
          </Button>

          {downloadLink && (
            <Button as="a" href={downloadLink} download colorScheme="green">
              Download Processed Video
            </Button>
          )}
        </VStack>
        <Box flex={2} bg="gray.800" borderRadius="md" p={4}>
          <VideoPlayer
            videoSrc={videoSrc}
            caption={caption}
            captionStyle={captionStyle}
          />
        </Box>
      </HStack>
    </Box>
  );
};

export default VideoEditor;
