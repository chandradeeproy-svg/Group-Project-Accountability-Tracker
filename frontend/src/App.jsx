import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const MyTasks = lazy(() => import("./pages/MyTasks.jsx"));
const MyGroups = lazy(() => import("./pages/MyGroups.jsx"));
const Activity = lazy(() => import("./pages/Activity.jsx"));
const Scores = lazy(() => import("./pages/Scores.jsx"));
const GroupDetails = lazy(() => import("./pages/GroupDetails.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));

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

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {!token ? (
                            <>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="*" element={<Navigate to="/login" />} />
                            </>
                        ) : (
                            <>
                                <Route element={<AppLayout />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/tasks" element={<MyTasks />} />
                                    <Route path="/groups" element={<MyGroups />} />
                                    <Route path="/groups/:groupId" element={<GroupDetails />} />
                                    <Route path="/activity" element={<Activity />} />
                                    <Route path="/scores" element={<Scores />} />
                                    <Route path="/" element={<Navigate to="/dashboard" />} />
                                </Route>
                            </>
                        )}
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
