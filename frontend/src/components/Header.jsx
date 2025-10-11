import { Box, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ImageButton } from "./ImageButton";
import { CircleIcon } from "./CircleIcon";
import AppIconNoText from "../assets/AppIconNotext.png";
import { TextButton } from "./TextButton";
import { useUser } from "../hooks/useUser";
import BlueIcon from "../assets/UserIcon_Blue.png";
import CreamIcon from "../assets/UserIcon_Cream.png";
import GreenIcon from "../assets/UserIcon_Green.png";
import PurpleIcon from "../assets/UserIcon_Purple.png";
import RedIcon from "../assets/UserIcon_Red.png";
import YellowIcon from "../assets/UserIcon_Yellow.png";

const iconMap = {
  blue: { src: BlueIcon, alt: "Blue Icon" },
  cream: { src: CreamIcon, alt: "Cream Icon" },
  green: { src: GreenIcon, alt: "Green Icon" },
  purple: { src: PurpleIcon, alt: "Purple Icon" },
  red: { src: RedIcon, alt: "Red Icon" },
  yellow: { src: YellowIcon, alt: "Yellow Icon" },
};

export const Header = () => {
  const { iconColor } = useUser();
  const { src, alt } = iconMap[iconColor] || iconMap.blue;

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding={{ base: 3, md: 4 }}
      position="sticky"
      top={0}
      zIndex="sticky"
      w="100%"
      bg="#FFFFFF"
    >
      <Box flex="1">
        <Link to="/profile">
          <CircleIcon src={src} alt={alt} />
        </Link>
      </Box>
      <Box>
        <Link to="/list">
          <ImageButton img={AppIconNoText} alt="SNR Logo" />
        </Link>
      </Box>
      <Box flex="1" display="flex" justifyContent="flex-end">
        <Link to="/input">
          <TextButton>つくる</TextButton>
        </Link>
      </Box>
    </Flex>
  );
};
