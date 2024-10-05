import React from "react";
import { Box, Text } from "@chakra-ui/react";

const Caption = ({ caption, style }) => {
  const { font, weight, color, position, size, display, animation } = style;

  const getPositionStyle = () => {
    const verticalPosition = position <= 50 ? "top" : "bottom";
    const distance = `${Math.abs(50 - position)}%`;
    return {
      [verticalPosition]: distance,
      left: "50%",
      transform: "translateX(-50%)",
    };
  };

  const getDisplayStyle = () => {
    switch (display) {
      case "Lines":
        return { whiteSpace: "pre-line" };
      case "Words":
        return { wordSpacing: "0.5em" };
      default:
        return {};
    }
  };

  const getAnimationStyle = () => {
    if (animation === "Spring") {
      return {
        transition: "all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
      };
    }
    return {};
  };

  return (
    <Box
      position="absolute"
      zIndex={10}
      textAlign="center"
      width="100%"
      {...getPositionStyle()}
    >
      <Text
        fontFamily={font}
        fontWeight={weight}
        color={color}
        fontSize={`${size * 0.5}em`}
        {...getDisplayStyle()}
        {...getAnimationStyle()}
      >
        {caption}
      </Text>
    </Box>
  );
};

export default Caption;
