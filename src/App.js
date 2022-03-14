import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import User from './User';
import Admin from './Admin';
import Header from './Header';

function App() {
  return (
    <>
      <Router>
          <div className="container">
            <Header></Header>
            <Routes>
              <Route exact path="/user" element={<User />} />
              <Route exact path="/admin" element={<Admin />} />
            </Routes>
          </div>
      </Router>
    </>
  );
}

export default App;
