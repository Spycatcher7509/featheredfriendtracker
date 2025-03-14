
import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

console.log('Starting application initialization...')

// Initialize QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
    },
  },
})

console.log('QueryClient initialized')

// Render immediately instead of waiting for DOMContentLoaded
const rootElement = document.getElementById("root")
if (!rootElement) {
  console.error("Failed to find the root element")
  throw new Error("Root element not found")
}

console.log('Root element found, creating root...')

const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)

console.log('App rendered successfully')

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful:', registration.scope)
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error)
      })
  })
}
