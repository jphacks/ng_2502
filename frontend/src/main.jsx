import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import './index.css'

// 1. ChakraProvider をインポートします
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme/theme.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. <App /> コンポーネント全体を <ChakraProvider> で囲みます */}
    <ChakraProvider theme={theme}>
      <ProfilePage />
    </ChakraProvider>
  </React.StrictMode>,
)