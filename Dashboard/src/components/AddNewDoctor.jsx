import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AddNewDoctor = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adhar, setAdhar] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [doctorDepartment, setDoctorDepartment] = useState("");
  const [docAvatar, setDocAvatar] = useState("");
  const [docAvatarPreview, setDocAvatarPreview] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigateTo = useNavigate();

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  // Today's date in YYYY-MM-DD, used to cap the DOB picker so future dates
  // can't be selected in the calendar UI
  const today = new Date().toISOString().split("T")[0];

  const handleAvatar = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      setDocAvatarPreview(reader.result);
      setDocAvatar(file);
    };
  };

  const handleAddNewDoctor = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password do not match!");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("adhar", adhar);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      formData.append("doctorDepartment", doctorDepartment);
      if (docAvatar) {
        formData.append("docAvatar", docAvatar);
      }

      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/doctor/addnew",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(data.message);
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
      setDoctorDepartment("");
      setDocAvatar("");
      setDocAvatarPreview("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="page">
      <section className="container form-component add-doctor-form">
        <div className="form-header">
          <img src="/logo.png" alt="logo" className="logo" />
          <h1 className="form-title">REGISTER A NEW DOCTOR</h1>
        </div>

        <form
          id="doctor-form"
          onSubmit={handleAddNewDoctor}
          autoComplete="off"
        >
          <div className="first-wrapper">
            <div className="avatar-section">
              <img
                src={docAvatarPreview || "/docHolder.jpg"}
                alt="Doctor Avatar"
              />
              <label className="avatar-upload-label">
                Profile Photo (optional)
                <input type="file" accept="image/*" onChange={handleAvatar} />
              </label>
            </div>

            <div className="right-column">
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

                <div className="form-group">
                  <label>
                    Department <span className="required">*</span>
                  </label>
                  <select
                    name="doctorDepartment"
                    value={doctorDepartment}
                    required
                    onChange={(e) => setDoctorDepartment(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departmentsArray.map((depart, index) => (
                      <option key={index} value={depart}>
                        {depart}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
              </div>
            </div>
          </div>
        </form>

        <div className="form-submit-wrapper">
          <button type="submit" form="doctor-form" className="submit-btn">
            REGISTER NEW DOCTOR
          </button>
        </div>
      </section>
    </section>
  );
};

export default AddNewDoctor;