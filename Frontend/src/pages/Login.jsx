import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        {
          email,
          password,
          role: "Patient",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res.data.message);
      setIsAuthenticated(true);
      navigateTo("/");

      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/google-login",
        {
          credential: credentialResponse.credential,
          role: "Patient",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(res.data.message);
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <section className="container form-component login-form">
      <img src="/logo.png" alt="logo" className="logo" />

      <h1 className="form-title">WELCOME TO ZEECARE</h1>

      <p>Please Login To Continue</p>
      <p>Login to Send Message and Get Appointment</p>

      <form onSubmit={handleLogin} autoComplete="off">
        <div className="form-group">
          <label>
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            Password <span className="required">*</span>
          </label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <p style={{ marginBottom: 0 }}>Not Registered?</p>
          <Link
            to={"/register"}
            style={{ textDecoration: "none", color: "#271776ca" }}
          >
            Register Now
          </Link>
        </div>

        <div className="form-submit-wrapper">
          <button type="submit" className="submit-btn">
            LOGIN
          </button>
        </div>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "20px 0",
        }}
      >
        <div style={{ flex: 1, height: "1px", background: "#d1d5db" }} />
        <span style={{ color: "#6b7280", fontSize: "14px" }}>OR</span>
        <div style={{ flex: 1, height: "1px", background: "#d1d5db" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => toast.error("Google Login Failed!")}
        />
      </div>
    </section>
  );
};

export default Login;