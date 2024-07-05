export const generateToken = (user, message, statusCode, res) => {
    const token = user.generateJsonWebToken();
    const cookiesName = user.role == "Admin" ? "adminToken" : "patientToken";
    res
        .status(statusCode)
        .cookie(cookiesName, token, {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        })
        .json({
        success: true,
        message,
        user,
        token,
    });
};