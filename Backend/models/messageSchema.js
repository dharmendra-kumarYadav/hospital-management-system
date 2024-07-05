import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "First Name Must Contain At least 3 Characters"],
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3, "Last Name Must Contain At least 3 Characters"],
    },
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, "Please Provide a valid email"],
    },
    phone: {
        type: String,
        required: true,
        minLength: [10, "Phone Number Must Contain Exactly 10 Digits"],
        maxLength: [10, "Phone Number Must Contain Exactly 10 Digits"],
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);  // Regular expression to ensure the phone number contains exactly 10 digits
            },
            message: "Phone Number Must Contain Only Digits",
        },
    },
    message: {
        type: String,
        required: true,
        minLength: [10, "Message Must Contain At Least 10 Characters"],
    },
});

export const Message = mongoose.model("Message", messageSchema);
