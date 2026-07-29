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

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const navigateTo = useNavigate();

  // Today's date in YYYY-MM-DD, used to cap the DOB picker so future dates
  // can't even be selected in the calendar UI
  const today = new Date().toISOString().split("T")[0];

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
          <button type="submit" className="submit-btn">
            REGISTER
          </button>
        </div>
      </form>
    </section>
  );
};

export default Register;