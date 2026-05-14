import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout.jsx";
import { useAuth } from "./auth/AuthContext.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const MyTasks = lazy(() => import("./pages/MyTasks.jsx"));
const MyGroups = lazy(() => import("./pages/MyGroups.jsx"));
const Activity = lazy(() => import("./pages/Activity.jsx"));
const Scores = lazy(() => import("./pages/Scores.jsx"));
const GroupDetails = lazy(() => import("./pages/GroupDetails.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));

// Loading component
const PageLoader = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    color: "var(--color-primary)",
    fontWeight: 600
  }}>
    Loading...
  </div>
);

function App() {
    const { token } = useAuth();
    
    // Redirect to login if not authenticated
    if (!token) {
        return (
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />}/>
                <Route path="/register" element={<Register />}/>
                <Route path="*" element={<Navigate to="/login" replace/>}/>
              </Routes>
            </Suspense>
          </BrowserRouter>
        );
    }

    return (
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />}/>
              <Route path="/tasks" element={<MyTasks />}/>
              <Route path="/groups" element={<MyGroups />}/>
              <Route path="/activity" element={<Activity />}/>
              <Route path="/scores" element={<Scores />}/>
              <Route path="/groups/:groupId" element={<GroupDetails />}/>
            </Route>
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Routes>
        </Suspense>
      </BrowserRouter>
    );
}

export default App;
