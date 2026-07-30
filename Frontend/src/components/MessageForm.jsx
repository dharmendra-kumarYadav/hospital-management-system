import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const MessageForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

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

  const handleMessage = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/message/send",
        {
          firstName,
          lastName,
          email,
          phone,
          message,
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
      setMessage("");
      setOtp("");
      setOtpSent(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="container form-component message-form">
      <h2>Send Us A Message</h2>

      <form onSubmit={handleMessage} autoComplete="off">

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
                placeholder="Enter email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="button"
                className="otp-btn"
                onClick={sendOtp}
                disabled={otpSent || sendingOtp}
              >
                {sendingOtp
                  ? "Sending..."
                  : otpSent
                  ? "OTP Sent"
                  : "Send OTP"}
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
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
            />
          </div>

        </div>

        {/* Third Row */}
        <div className="form-row">

          <div className="form-group">
            <label>
              Mobile Number <span className="required">*</span>
            </label>

            <input
              type="text"
              placeholder="Enter mobile number"
              value={phone}
              required
              maxLength={10}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
            />
          </div>

        </div>

        {/* Message */}
        <div className="form-group">
          <label>
            Message <span className="required">*</span>
          </label>

          <textarea
            rows={6}
            placeholder="Write your message..."
            value={message}
            required
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-btn">
          Send Message
        </button>

      </form>

      <img src="/Vector.png" alt="vector" />
    </div>
  );
};

export default MessageForm;