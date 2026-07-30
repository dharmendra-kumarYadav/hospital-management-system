import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adhar, setAdhar] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const navigateTo = useNavigate();

  // Today's date in YYYY-MM-DD, used to cap the DOB picker
  const today = new Date().toISOString().split("T")[0];

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
        "http://localhost:4000/api/v1/user/otp/send",
        { email },
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

  const handleRegistration = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/patient/register",
        {
          firstName,
          lastName,
          email,
          phone,
          adhar,
          dob,
          gender,
          password,
          confirmPassword,
          otp,
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

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAdhar("");
      setDob("");
      setGender("");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setOtpSent(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <section className="container form-component register-form">
      <img src="/logo.png" alt="logo" className="logo" />

      <h1 className="form-title">WELCOME TO ZEECARE</h1>

      <p>Please Sign Up To Continue</p>
      <p>
        Please sign up to access hospital services and manage your
        appointments.
      </p>

      <form onSubmit={handleRegistration} autoComplete="off">
        <div className="form-group">
          <label>
            First Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            placeholder="Enter your first name"
            value={firstName}
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Enter your last name (optional)"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

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
        )}

        <div className="form-group">
          <label>
            Mobile Number <span className="required">*</span>
          </label>
          <input
            type="number"
            name="phone"
            placeholder="Enter your mobile number"
            value={phone}
            required
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            Adhar Number <span className="required">*</span>
          </label>
          <input
            type="number"
            name="adhar"
            placeholder="Enter your Adhar number"
            value={adhar}
            required
            onChange={(e) => setAdhar(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            Date of Birth <span className="required">*</span>
          </label>
          <input
            type="date"
            name="dob"
            value={dob}
            max={today}
            required
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            Gender <span className="required">*</span>
          </label>
          <select
            name="gender"
            value={gender}
            required
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
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

        <div className="form-group">
          <label>
            Confirm Password <span className="required">*</span>
          </label>
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
          <p style={{ marginBottom: 0 }}>Already Registered?</p>
          <Link
            to={"/login"}
            style={{ textDecoration: "none", color: "#271776ca" }}
          >
            Login Now
          </Link>
        </div>

        <div className="form-submit-wrapper">
          <button
            type="submit"
            className="submit-btn"
            disabled={!otpSent}
          >
            REGISTER
          </button>
        </div>
      </form>
    </section>
  );
};

export default Register;