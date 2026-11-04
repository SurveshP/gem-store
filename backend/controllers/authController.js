// ==================== LOGIN ====================
export const loginAdmin = (req, res) => {
    const { userName, password } = req.body;

    // Yahan aap database se bhi check kar sakte hain, filhal hardcode kar rahe hain
    if (userName === 'Admin' && password === '123456') {
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: "dummy-jwt-token-123456", // Real app mein yahan JWT generate hota hai
            user: { name: "Admin" }
        });
    }

    return res.status(401).json({
        success: false,
        message: "Invalid username or password"
    });
};