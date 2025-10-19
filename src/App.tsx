import { Routes, Route } from "react-router-dom";
import { PrivateLayout } from "./components/layouts/PrivateLayout";
import ProtectedRoute from "./components/ProtectedRoutes";
import { LoginPageComponent } from "./components/Login";
import { HomePage } from "./pages/HomePage";

const LoginPage = () => <LoginPageComponent />;
const RegisterPage = () => <h1>Registro (Rota Pública)</h1>;

const HomePageComponent = () => <HomePage />;
const ProfilePage = () => <h1>Perfil (Rota Privada)</h1>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={
            <PrivateLayout>
              <Routes>
                <Route path="/home" element={<HomePageComponent />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </PrivateLayout>
          }
        />
      </Route>

      <Route path="*" element={<h1>404 - Não Encontrado</h1>} />
    </Routes>
  );
}

export default App;
