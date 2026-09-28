import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/layout/Navbar";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      e.email = "Enter a valid email";
    if (!formData.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);
    // remember=true → localStorage (survives browser close)
    // remember=false → sessionStorage (cleared when tab closes)
    const result = await login(formData, remember);
    setIsLoading(false);
    if (result.success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-warm-50 relative overflow-hidden">
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "#7C5CBF",
          filter: "blur(80px)",
          opacity: 0.12,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "#FF6B6B",
          filter: "blur(80px)",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      />
      <Navbar />
      <div className="container-custom py-16 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-up">
            <div className="text-5xl mb-3"></div>
            <h1
              className="text-3xl font-black text-violet-900 mb-2"
              style={{ fontFamily: "Nunito,sans-serif" }}
            >
              Welcome back!
            </h1>
            <p className="text-violet-600">Your perfect roomie is waiting.</p>
          </div>
          <Card className="animate-fade-up stagger-1">
            <form onSubmit={handleSubmit} noValidate>
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@university.edu"
                icon={<span>📧</span>}
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Your password"
                icon={<span>🔒</span>}
                required
              />

              {/* Remember me — stores token in localStorage when checked */}
              <div className="flex items-center justify-between mb-6 text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-violet-300 accent-coral-500 cursor-pointer"
                  />
                  <span className="text-violet-600 font-medium">
                    Remember me{" "}
                    <span className="text-violet-400 font-normal">
                      (stay logged in)
                    </span>
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-coral-500 hover:text-coral-600 font-semibold"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
              >
                Sign in 
              </Button>
            </form>
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-violet-100" />
              <span className="text-xs text-violet-400 font-semibold">OR</span>
              <div className="flex-1 h-px bg-violet-100" />
            </div>
            <p className="text-center text-violet-600 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-coral-500 font-bold">
                Sign up free
              </Link>
            </p>
          </Card>
          <p className="text-center text-xs text-violet-400 mt-6">
            Your data is safe. We never share it.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
