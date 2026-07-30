import { FaEye, FaEyeSlash } from "react-icons/fa";
import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const AddNewAdmin = () => {
  const { isAuthenticated } = useContext(Context);

  const navigateTo = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adhar, setAdhar] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async () => {

  if (!email) {
    toast.error("Please enter Email Address first.");
    return;
  }

  try {
    const { data } = await axios.post(
      "http://localhost:4000/api/v1/user/otp/send",
      { email }
    );

    toast.success(data.message);

  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to send OTP"
    );
  }
};

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password do not match!");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/admin/addnew",
        {
          firstName,
          lastName,
          email,
          phone,
          adhar,
          dob,
          gender,
          otp,
          password,
          confirmPassword,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(data.message);

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
      navigateTo("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="page">
      <section className="container form-component add-admin-form">
        <img src="/logo.png" alt="logo" className="logo" />

        <h1 className="form-title">ADD NEW ADMIN</h1>

        <form onSubmit={handleAddNewAdmin} autoComplete="off">

          {/* First Row */}
          <div className="form-row">

            <div className="form-group">
              <label>
                First Name <span className="required">*</span>
              </label>

              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
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
                placeholder="Enter last name (optional)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

          </div>

          {/* Second Row */}

          <div className="form-row">

            <div className="form-group">
              <label>
                Email Address <span className="required">*</span>
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter email address"
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
                type="tel"
                name="phone"
                placeholder="Enter mobile number"
                value={phone}
                maxLength={10}
                required
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

          </div>

          {/* Third Row */}

          <div className="form-row">

            <div className="form-group">
              <label>
                Aadhaar Number <span className="required">*</span>
              </label>

              <input
                type="text"
                name="adhar"
                placeholder="Enter Aadhaar number"
                value={adhar}
                maxLength={12}
                required
                onChange={(e) =>
                  setAdhar(e.target.value.replace(/\D/g, ""))
                }
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

          </div>

          {/* Fourth Row */}

          <div className="form-row">

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

          </div>

          <div className="form-row">

  <div className="form-group otp-group">
    <label>
      Verification OTP <span className="required">*</span>
    </label>

    <input
      type="text"
      placeholder="Enter OTP"
      value={otp}
      maxLength={6}
      required
      onChange={(e) =>
        setOtp(e.target.value.replace(/\D/g, ""))
      }
    />
  </div>

  <button
    type="button"
    className="otp-btn"
    onClick={handleSendOtp}
  >
    Send OTP
  </button>

</div>

          {/* Fifth Row */}

          <div className="form-row">

            <div className="form-group">
              <label>
                Password <span className="required">*</span>
              </label>

              <div className="password-field">

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
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
                  placeholder="Confirm password"
                  value={confirmPassword}
                  required
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-icon"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>
            </div>

          </div>

          <div className="form-submit-wrapper">
            <button type="submit" className="submit-btn">
              ADD NEW ADMIN
            </button>
          </div>

        </form>
      </section>
    </section>
  );
};

export default AddNewAdmin;