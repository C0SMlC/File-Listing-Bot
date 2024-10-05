"use client";

import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Image,
  Flex,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const VideoThumbnail = ({ title, imageUrl, onClick }) => (
  <Box
    borderWidth={1}
    borderRadius="lg"
    overflow="hidden"
    onClick={onClick}
    cursor="pointer"
  >
    <Image src={imageUrl} alt={title} />
    <Box p={2}>
      <Text fontWeight="semibold" isTruncated>
        {title}
      </Text>
    </Box>
  </Box>
);

export default function Dashboard() {
  const router = useRouter();

  const handleGenerate = () => {
    router.push("/editor/new");
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Your videos</Heading>
        <Flex>
          <Input placeholder="Paste link or drop a file" flex={1} mr={4} />
          <Button colorScheme="blue" onClick={handleGenerate}>
            Generate
          </Button>
        </Flex>
        <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
          <VideoThumbnail
            title="How I Would Invest $1000 If I Were In M..."
            imageUrl="/cover.png"
            onClick={() => router.push("/editor")}
          />
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
