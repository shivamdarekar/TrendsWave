import express from "express";
import passport from "../config/passport.js";
import { User } from "../models/user.model.js";
import { protect } from "../middleware/authMiddleware.js";
import generateAccessAndRefreshToken from "../utils/tokens.js";

const router = express.Router();

//start google Oauth
router.get("/google", (req, res, next) => {
  req.session.oauth_flow_data = {
    role: req.query.role || "customer",
    //redirect: req.query.redirect || "/",
  };

  passport.authenticate("google", {
    scope: ["profile", "email"], //tells Google what info you want.
  })(req, res, next);
});

//handle google callback
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, async (err, user) => {
    try {
      if (err || !user) {
        const fail = `${process.env.FRONTEND_URL}/login?error=google_auth_failed`;
        console.log(err)
        return res.redirect(fail);
      }

      //Issue your exsiting tokens and set cookies
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
      );

      await User.findByIdAndUpdate(
        user._id,
        { refreshToken },
        { validateBeforeSave: false }
      );

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
      };

      res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options);

      // Reliably get the redirect path from the session
      // const redirectTo = req.session.oauth_flow_data?.redirect || "/";

      // // Clean up the session data after use
      // if (req.session.oauth_flow_data) {
      //   delete req.session.oauth_flow_data?.redirect;
      // }

      // // Redirect the user to their intended destination (e.g., /checkout)
      let To ="/"
      res.redirect(`${process.env.FRONTEND_URL}${To}`);
      
    } catch (e) {
      const fail = `${process.env.FRONTEND_URL}/login?error=server_error`;
      return res.redirect(fail);
    }
  })(req, res, next);
});

router.get("/me", protect, async (req, res) => {
  const me = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  res.json({ user: me });
});

export default router;
