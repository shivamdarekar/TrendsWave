import helmet from "helmet";
import rateLimit from "express-rate-limit";


//  Security Middleware
export const applySecurity = (app) => {
  //  Secure HTTP headers
  app.use(helmet());

  //  Global API rate limiter (100 requests / 15min per IP)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api", apiLimiter);

  //  Stricter limiter for auth routes (e.g., prevent brute force login)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8, // only 5 login attempts in 15 minutes
    message: "Too many login attempts, please try again later.",
  });
  app.use("/api/auth", authLimiter);
};
