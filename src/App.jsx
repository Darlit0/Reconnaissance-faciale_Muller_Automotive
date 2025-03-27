import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Layout from "./components/Layout";
import Edit from './Pages/Edit';
import AddUser from './Pages/AddUser';
import Seuil from './Pages/RecoFace';
import Error404 from './Pages/Error404';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/admin" element={<Home />} />
          <Route path="/Edit/:userId" element={<Edit />} />
          <Route path="/Add" element={<AddUser />} />
          <Route path="/Seuil" element={<Seuil />} />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;