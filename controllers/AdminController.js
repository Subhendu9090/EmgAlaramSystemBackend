import { GenerateJwt } from "../utils/helper.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || email.trim() === "" || password.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide valid email and password",
      });
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.PASSWORD
    ) {
      return res.status(400).json({
        success: false,
        message: "Wrong email id or password",
      });
    }

    const token = GenerateJwt((email, "email"));

    res.status(200).json({
      success: true,
      message: "Admin login successfully",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong in adminLogin",
    });
  }
};
