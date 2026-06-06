import "./Style/common.scss"
import { Suspense, lazy } from "react"
import { Route, Routes } from "react-router-dom"

const LoginPage = lazy(() => import("../Pages/LoginPage/LoginPage"))

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<div>Loading...</div>}><LoginPage /></Suspense>}/>
    </Routes>
  )
}

export default App
