import { Navigate, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import Dashboard from "./pages/Dashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import CreateSpace from "./pages/CreateSpace";
import LandingPage from "./pages/LandingPage";
import ReviewPage from "./pages/ReviewPage";
import ViewSpace from "./pages/ViewSpace";
// Protected Route component to check if the user is authenticated and verified
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// Redirect authenticated users to the home page ("/") to prevent accessing login/signup pages
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to='/' replace />;
	}

	return children;
};

function App() {
	// Managing theme mode (light/dark)
	const [themeMode, setThemeMode] = useState(() => {
		try {
			const storedTheme = localStorage.getItem("themeMode");
			return storedTheme ? JSON.parse(storedTheme) : "light";
		} catch (error) {
			return "light";
		}
	});

	// Function to switch to dark theme
	const darkTheme = () => {
		setThemeMode("dark");
	};

	// Function to switch to light theme
	const lightTheme = () => {
		setThemeMode("light");
	};

	// Apply theme mode on theme change and store in localStorage
	useEffect(() => {
		document.querySelector("html").classList.remove("dark", "light");
		document.querySelector("html").classList.add(themeMode);
		localStorage.setItem("themeMode", JSON.stringify(themeMode));
	}, [themeMode]);

	const { isCheckingAuth, checkAuth } = useAuthStore();

	// Check authentication status on mount
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// Show loading spinner while checking auth
	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<GoogleOAuthProvider clientId="136538803160-u1db190rnb7l7jfdvh6rf83hjna62ibn.apps.googleusercontent.com">
			<Toaster />
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<LandingPage/>} />
			
				
				{/* Protected Routes */}
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
        <Route
					path="/viewspace/:link"
					element={
						<ProtectedRoute><ViewSpace /></ProtectedRoute>
							
					}
				/>
				<Route
					path="/create-space"
					element={
						<ProtectedRoute>
							<CreateSpace />
						</ProtectedRoute>
					}
				/>
				
				{/* Authentication-related Routes */}
				<Route
					path="/signup"
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
        <Route
					path="/review/:link"
					element={
						<ReviewPage />
            
						
					}
				/>
				<Route
					path="/login"
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path="/verify-email" element={<EmailVerificationPage />} />
				<Route
					path="/forgot-password"
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path="/reset-password/:token"
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				
				{/* Catch-all Route for 404 */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
    
		</GoogleOAuthProvider>
	);
}

export default App;
