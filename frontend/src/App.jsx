import { useState } from "react";
import "./App.css";
import { TextButton } from "./components/TextButton";
import { FaSearch, FaRegHeart, FaHeart, FaCamera } from "react-icons/fa";
import { MarkButton } from "./components/MarkButton";
import { ImageButton } from "./components/ImageButton";
import iconImage from "./assets/AppIcon.png"; // 画像をインポート
import { ReactionButton } from "./components/ReactionButton";

function App() {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  return (
    <>
      <TextButton>Click Me</TextButton>
      <br />
      <MarkButton label="Camera" icon={<FaCamera />} />
      <br />
      <ReactionButton
        label="Like"
        icon={isLiked ? <FaHeart /> : <FaRegHeart />}
        onClick={handleLikeClick}
      />
      <br />
      <ImageButton img={iconImage} alt="アイコン画像" />
    </>
  );
}

export default App;
