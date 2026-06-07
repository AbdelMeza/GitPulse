import "./Style/common.scss"
import { Suspense, lazy } from "react"
import { Route, Routes } from "react-router-dom"

const LoginPage = lazy(() => import("../Pages/LoginPage/LoginPage"))
const Dashboard = lazy(() => import("../Pages/Dashboard/Dashboard"))

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<div>Loading...</div>}><LoginPage /></Suspense>}/>
      <Route path="/dashboard" element={<Dashboard /> } />
    </Routes>
  )
}

export default App
