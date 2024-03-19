import { createBrowserRouter, RouterProvider } from "react-router-dom"

import UploadPage from "./pages/UploadPage"
import SettingsPage from "./pages/SettingsPage"
import MainLayout from "./pages/MainLayout"

// build the routes
const router = createBrowserRouter([
  { element: <MainLayout />, children: [
    { index: true, path: "/", element: <UploadPage />},
    { path: "/settings", element: <SettingsPage />}
  ]}
  
])

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
