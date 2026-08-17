import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HostApp from './HostApp';
import PlayerApp from './PlayerApp';

import AdminApp from './AdminApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/host" element={<HostApp />} />
        <Route path="/*" element={<PlayerApp />} />
      </Routes>
    </Router>
  );
}

export default App;
