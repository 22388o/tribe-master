import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import JoinTribe from "./pages/JoinTribe"
import CreateTribe from "./pages/CreateTribe"
import About from "./pages/About"
import Home from "./pages/Home"
import Layout from "./components/Layout"
import CreateTribeNostr from "./pages/CreateTribe pages/CreateTribeNostr"
import CreateTribeBtc from "./pages/CreateTribe pages/CreateTribeBtc"
import CreateTribeOrdinals from "./pages/CreateTribe pages/CreateTribeOrdinals"
import MultisigPage from "./pages/MultisigPage"



function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path='create' element={<CreateTribe />}>
            <Route path="nostr" element={<CreateTribeNostr />}/>
            
            <Route path='bitcoin' element={<CreateTribeBtc />} />
            
            <Route path='ordinals' element={<CreateTribeOrdinals />}/>
          </Route>
          <Route path='join' element={<JoinTribe />}/>
          <Route path='about' element={<About />}/>
          <Route path='multisigPage' element={<MultisigPage />}/>
        </Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App