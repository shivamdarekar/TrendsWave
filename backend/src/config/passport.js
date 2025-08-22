// npm i passport passport-google-oauth20 

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";
import { User } from "../models/user.model.js";


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true //so we can read state later
        },

        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value?.toLowerCase();
                const avatar = profile.photos?.[0]?.value?.replace("=s96-c", "=s256-c") || "";

                //if user exists by googleId return it
                let user = await User.findOne({ googleId: profile.id });

                //if not, try to link by email (existing local account)
                if (!user && email) {
                    user = await User.findOne({ email });
                    if (user) {
                        user.googleId = profile.id;
                        user.provider = "google";
                        if (avatar) user.avatar = avatar;
                        await user.save({ validateBeforeSave: false });
                    }
                }

                //if still not found create a new user
                if (!user) {

                    // Read the role directly from the session where we stored it.
                    const userRole = req.session.oauth_flow_data?.role || "customer";

                    // It's good practice to clean up the session after use.
                    if ( req.session.oauth_flow_data ) {
                        delete  req.session.oauth_flow_data?.role 
                    }

                    const randomPassword = crypto.randomBytes(32).toString("hex")
                    const password = `${randomPassword}%`
                    user = await User.create({
                        name: profile.displayName || "Google User",
                        email: email || `user-${profile.id}@google.local`,
                        password: password, //hashed by pre-save
                        googleId: profile.id,
                        provider: "google",
                        avatar,
                        role: userRole, // Use the role from the session
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);


export default passport;