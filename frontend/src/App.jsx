// App.jsx
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login/Login';

function App() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}

export default App;