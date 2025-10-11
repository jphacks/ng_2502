import { Button } from "@chakra-ui/react"

export const ImageButton = ({ img, alt, ...rest }) => {
    return (
        <Button
            {...rest}
            boxSize={{ base: "40px", md: "50px", lg: "60px" }} // 画面サイズに応じてボタンのサイズを変更
            p={0} // パディングを削除
            border="none"
            _hover={{ opacity: 0.8 }}
            _focus={{ boxShadow: "none", outline: "none" }}
            bg="transparent"
        >
            <img src={img} alt={alt} style={{ height: '100%', objectFit: 'cover' }} />
        </Button>
    )
}