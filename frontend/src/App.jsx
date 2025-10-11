import './App.css'
import { TextButton } from './components/TextButton'
import { FaSearch } from 'react-icons/fa'
import { MarkButton } from './components/MarkButton'
import { ImageButton } from './components/ImageButton'
import iconImage from './assets/AppIcon.png' // 画像をインポート

function App() {


  return (
    <>
      <TextButton>Click Me</TextButton>
      <br />
      <MarkButton label="Search database" icon={<FaSearch />} />
      <br />
      <ImageButton img={iconImage} alt="アイコン画像" />
    </>
  )
}

export default App
