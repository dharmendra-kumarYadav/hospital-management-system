import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AppointmentForm = () => {
  const navigateTo = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adhar, setAdhar] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [address, setAddress] = useState("");
  const [hasVisited, setHasVisited] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [doctors, setDoctors] = useState([]);

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

  // Send OTP
  const sendOtp = async () => {
    if (!email) {
      return toast.error("Please enter your email first.");
    }

    try {
      setSendingOtp(true);

      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/otp/send",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(data.message);
      setOtpSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Fetch Doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors",
          {
            withCredentials: true,
          }
        );

        setDoctors(data.doctors);
      } catch (error) {
        toast.error("Unable to fetch doctors.");
      }
    };

    fetchDoctors();
  }, []);

  // Book Appointment
  const handleAppointment = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/appointment/post",
        {
          firstName,
          lastName,
          email,
          phone,
          adhar,
          dob,
          gender,
          appointment_date: appointmentDate,
          department,
          doctor_firstName: doctorFirstName,
          doctor_lastName: doctorLastName,
          hasVisited,
          address,
          otp,
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
      setAppointmentDate("");
      setDepartment("");
      setDoctorFirstName("");
      setDoctorLastName("");
      setAddress("");
      setHasVisited(false);

      setOtp("");
      setOtpSent(false);

      navigateTo("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container form-component appointment-form">
      <h2>Book an Appointment</h2>

      <form onSubmit={handleAppointment} autoComplete="off">
        {/* First Row */}
        <div className="form-row">
          <div className="form-group">
            <label>
              First Name <span className="required">*</span>
            </label>

            <input
              type="text"
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
              placeholder="Enter last name"
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

            <div className="otp-input-group">
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                required
                disabled={otpSent}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtp("");
                  setOtpSent(false);
                }}
              />

              <button
                type="button"
                className="otp-btn"
                onClick={sendOtp}
                disabled={otpSent || sendingOtp}
              >
                {sendingOtp ? "Sending..." : otpSent ? "OTP Sent" : "Send OTP"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              OTP <span className="required">*</span>
            </label>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              required
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        {/* Department + Doctor Row */}
        <div className="form-row">
          <div className="form-group">
            <label>
              Department <span className="required">*</span>
            </label>

            <select
              value={department}
              required
              onChange={(e) => {
                setDepartment(e.target.value);
                setDoctorFirstName("");
                setDoctorLastName("");
              }}
            >
              <option value="">Select Department</option>
              {departmentsArray.map((dept, index) => (
                <option value={dept} key={index}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Doctor <span className="required">*</span>
            </label>

            <select
              value={`${doctorFirstName} ${doctorLastName}`}
              required
              disabled={!department}
              onChange={(e) => {
                const [selectedFirstName, ...selectedLastName] =
                  e.target.value.split(" ");
                setDoctorFirstName(selectedFirstName);
                setDoctorLastName(selectedLastName.join(" "));
              }}
            >
              <option value="">Select Doctor</option>

              {doctors
                .filter((doctor) => doctor.doctorDepartment === department)
                .map((doctor) => (
                  <option
                    key={doctor._id}
                    value={`${doctor.firstName} ${doctor.lastName}`}
                  >
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="form-group">
          <label>
            Address <span className="required">*</span>
          </label>

          <textarea
            rows={5}
            placeholder="Enter your complete address"
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Previous Visit */}
        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={hasVisited}
            onChange={(e) => setHasVisited(e.target.checked)}
          />

          <label>Have you visited before?</label>
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn">
          GET APPOINTMENT
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
