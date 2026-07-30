import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPassword = () => {
  const location = useLocation();
  const navigateTo = useNavigate();

  const role = location.state?.role || "Patient";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email first!");
      return;
    }
    setSendingOtp(true);
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/password/forgot",
        { email, role },
        { withCredentials: true }
      );
      toast.success(data.message);
      setOtpSent(true);
      startCooldown();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New Password and Confirm Password do not match!");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/password/reset",
        {
          email,
          role,
          otp,
          newPassword,
          confirmNewPassword,
        },
        { withCredentials: true }
      );

      toast.success(data.message);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <section className="container form-component login-form">
      <img src="/logo.png" alt="logo" className="logo" />

      <h1 className="form-title">RESET YOUR PASSWORD</h1>

      <p>Enter your email to receive a one-time password (OTP)</p>

      <form onSubmit={handleResetPassword} autoComplete="off">
        <div className="form-group">
          <label>
            Email Address <span className="required">*</span>
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              required
              disabled={otpSent}
              onChange={(e) => setEmail(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="submit-btn"
              style={{ width: "auto", padding: "0 20px", height: "54px" }}
              disabled={sendingOtp || resendCooldown > 0}
              onClick={handleSendOtp}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Send OTP"}
            </button>
          </div>
        </div>

        {otpSent && (
          <>
            <div className="form-group">
              <label>
                Enter OTP <span className="required">*</span>
              </label>
              <input
                type="text"
                name="otp"
                placeholder="Enter the 6-digit code sent to your email"
                value={otp}
                maxLength={6}
                required
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="form-group">
              <label>
                New Password <span className="required">*</span>
              </label>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  required
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="form-group">
              <label>
                Confirm New Password <span className="required">*</span>
              </label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  required
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-icon"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="form-submit-wrapper">
          <button type="submit" className="submit-btn" disabled={!otpSent}>
            RESET PASSWORD
          </button>
        </div>
      </form>

      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <Link
          to="/login"
          style={{ textDecoration: "none", color: "#271776ca" }}
        >
          Back to Login
        </Link>
      </div>
    </section>
  );
};

export default ForgotPassword;