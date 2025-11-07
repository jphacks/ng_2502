import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  HStack,
  Box,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { useState } from "react";
import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import slide4 from "../assets/slide4.png";
import slide5 from "../assets/slide5.png";
import slide6 from "../assets/slide6.png";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const images = [slide1, slide2, slide3, slide4, slide5, slide6];

export default function SlideModal({ isOpen, onClose }) {
  const [index, setIndex] = useState(0);
  // responsive values
  const modalSize = useBreakpointValue({ base: "full", md: "xl" });
  const contentPadding = useBreakpointValue({ base: 2, md: 4 });
  const borderRadius = useBreakpointValue({ base: "md", md: "2xl" });
  const iconBtnSize = useBreakpointValue({ base: "sm", md: "md" });
  const iconPx = useBreakpointValue({ base: 18, md: 24 });

  const handleNext = () => setIndex((i) => (i + 1) % images.length);
  const handlePrev = () =>
    setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={modalSize}>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent
        bg="white"
        p={contentPadding}
        borderRadius={borderRadius}
        maxW={{ base: "md", md: "xl" }}
        display={{ base: "flex", md: "block" }}
        alignItems={{ base: "center", md: "stretch" }}
        justifyContent={{ base: "center", md: "flex-start" }}
        minH={{ base: "auto", md: "auto" }}
      >
        <ModalCloseButton
          _focus={{ boxShadow: "none", outline: "none" }}
          border={"none"}
          color="#80CBC4"
        />
        <ModalBody
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent={{ base: "center", md: "flex-start" }}
          w="100%"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            maxH={{ base: "80vh", md: "70vh" }}
            overflow="hidden"
            w="100%"
            maxW={{ base: "90vw", md: "60vw" }}
          >
            <Image
              src={images[index]}
              alt={`Slide ${index + 1}`}
              maxH={{ base: "80vh", md: "70vh" }}
              maxW="100%"
              objectFit="contain"
            />
          </Box>

          <HStack mt={0} spacing={4}>
            <IconButton
              aria-label="Previous slide"
              icon={<IoIosArrowBack size={iconPx} />}
              onClick={handlePrev}
              variant="ghost"
              isRound
              size={iconBtnSize}
              _focus={{ boxShadow: "none", outline: "none" }}
              border={"none"}
              color="#80CBC4"
            />
            <IconButton
              aria-label="Next slide"
              icon={<IoIosArrowForward size={iconPx} />}
              onClick={handleNext}
              variant="ghost"
              isRound
              size={iconBtnSize}
              _focus={{ boxShadow: "none", outline: "none" }}
              border={"none"}
              color="#80CBC4"
            />
          </HStack>

          <Box mt={2} fontSize="sm" color="gray.500">
            {index + 1} / {images.length}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
