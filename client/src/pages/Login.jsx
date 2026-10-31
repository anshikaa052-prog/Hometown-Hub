
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await API.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const user = response.data.user;
      const userId = user?._id || user?.id;

      if (userId) {
        localStorage.setItem("userId", userId);
      }

      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        setErrorMessage(
          error.response.data?.message ||
            "Login failed. Please check your credentials."
        );
      } else if (error.request) {
        setErrorMessage(
          "Unable to connect to the server. Please try again."
        );
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-decoration login-decoration-one" />
      <div className="login-decoration login-decoration-two" />

      <section className="login-card">
        <div className="login-brand-icon" aria-hidden="true">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 22L24 7L42 22V41H29V29H19V41H6V22Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M3 22L24 5L45 22"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="login-eyebrow">WELCOME BACK</p>
        <h1 className="login-title">Welcome home!</h1>
        <p className="login-subtitle">
          Connect with your community and stay close to your roots.
        </p>

        {errorMessage && (
          <div className="login-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing you in..." : "Sign in"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <p className="login-signup">
          New to Hometown Hub?
          <button
            type="button"
            className="login-signup-link"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </button>
        </p>

        <div className="login-footer">
          A little closer to home, wherever you are.
        </div>
      </section>
    </main>
  );
}

export default Login;
