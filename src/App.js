import "./App.css";
import { Route, Routes } from "react-router-dom";
import PokeTanksPage from "./Components/PokeTanksPage/PokeTanksPage";
import GameBoard from "./Components/GameBoard/GameBoard";

function App() {
  return (
        <div className="App">
          <Routes>
            <Route path="/" element={<PokeTanksPage />} />
            <Route path="/poketanksgame" element={<GameBoard />} />
          </Routes>
        </div>
  );
}

export default App;
