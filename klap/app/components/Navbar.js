import { Box, Flex, Text, Button, Spacer } from "@chakra-ui/react";

const Navbar = () => {
  return (
    <Box bg="white" px={4} shadow="sm">
      <Flex h={16} alignItems="center">
        <Text fontSize="xl" fontWeight="bold">
          CLAP
        </Text>
        <Spacer />
        <Button variant="ghost" mr={3}>
          Dashboard
        </Button>
        <Button variant="ghost" mr={3}>
          Exports
        </Button>
        <Button variant="ghost" mr={3}>
          Settings
        </Button>
        <Button colorScheme="blue">Upgrade</Button>
      </Flex>
    </Box>
  );
};

export default Navbar;
