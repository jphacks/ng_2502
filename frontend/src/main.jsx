import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. ChakraProvider をインポートします
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. <App /> コンポーネント全体を <ChakraProvider> で囲みます */}
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)