import { Button } from "@chakra-ui/react"

export const TextButton=({children})=>{
    return( <Button
        bg="#FFB433"
        color="#FFFFFF"
        variant={"solid"}
        border={"none"}
        _hover={{opacity: 0.8 }}
        _focus={{ boxShadow: "none", outline: "none" }}
        size={{ base: "sm", md: "md", lg: "lg" }} // 画面サイズに応じてボタンのサイズを変更 (sm:モバイル, md:タブレット, lg:デスクトップ)
        fontSize={{ base: "14px", md: "16px", lg: "18px" }} // 画面サイズに応じてフォントサイズを変更
    >
        {children}
    </Button> )
}