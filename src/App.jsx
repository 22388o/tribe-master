import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import JoinTribe from "./pages/JoinTribe"
import CreateTribe from "./pages/CreateTribe"
import About from "./pages/About"
import Home from "./pages/Home"
import Layout from "./components/Layout"



function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path='create' element={<CreateTribe />}/>
          <Route path='join' element={<JoinTribe />}/>
          <Route path='about' element={<About />}/>
        </Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App