import "./Style/common.scss"
import { Suspense, lazy, useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import useTheme from "../Stores/useTheme"

const LoginPage = lazy(() => import("../Pages/LoginPage/LoginPage"))
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"))
const Overview = lazy(() => import("../Pages/Dashboard/Overview/Overview"))

function App() {

  const { theme } = useTheme()

  useEffect(() => {
    if (!theme) {
      const savedTheme = localStorage.getItem("theme") || "light"
      document.body.setAttribute("data-theme", savedTheme)
    } else {
      document.body.setAttribute("data-theme", theme)
    }

  }, [theme])
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<div>Loading...</div>}><LoginPage /></Suspense>} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Overview />} />
        <Route path="analytics" element={""} />
        <Route path="commits" element={""} />
        <Route path="profile" element={""} />
        <Route path="settings" element={""} />
      </Route>
    </Routes>
  )
}

export default App
