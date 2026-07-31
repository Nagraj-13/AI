"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, UserCheck, ShieldCheck, ArrowRight, UserPlus, Lock, Mail, User, AlertCircle, CheckCircle2 } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = searchParams.get("role") === "candidate" ? "CANDIDATE" : "RECRUITER";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [role, setRole] = useState<"RECRUITER" | "CANDIDATE">(initialRole);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (mode === "signup") {
      if (!name.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed. Please check your credentials.");
        return;
      }

      setSuccessMessage(mode === "signup" ? "Account created successfully! Redirecting..." : "Logged in successfully! Redirecting...");
      localStorage.setItem("user_session", JSON.stringify(data.data));

      // Trigger navigation event for components like Navbar
      window.dispatchEvent(new Event("auth-changed"));

      setTimeout(() => {
        if (role === "RECRUITER") {
          router.push("/recruiter/dashboard");
        } else {
          router.push("/candidate/dashboard");
        }
      }, 800);
    } catch (err: any) {
      console.error("Auth submit error:", err);
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-6 pb-16 animate-fadeIn">
      <Card className="border-[#222222] bg-[#0a0a0a] shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-black font-bold mx-auto flex items-center justify-center text-lg mb-3 shadow-lg">
            ▲
          </div>
          <CardTitle className="text-xl font-black text-white">
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {mode === "login"
              ? "Sign in to access your recruitment dashboard or candidate portal"
              : "Sign up to post jobs or upload resumes for AI match evaluation"}
          </CardDescription>
        </CardHeader>

        {/* Mode Switcher Tabs (Sign In vs Create Account) */}
        <div className="flex border-b border-[#222222] bg-[#111111]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              mode === "login"
                ? "border-white text-white bg-[#0a0a0a]"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage("");
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              mode === "signup"
                ? "border-white text-white bg-[#0a0a0a]"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6">
          {/* Role Selector */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-[#141414] rounded-xl border border-[#222222]">
              <button
                type="button"
                onClick={() => setRole("RECRUITER")}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  role === "RECRUITER"
                    ? "bg-white text-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Recruiter / HR</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("CANDIDATE")}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  role === "CANDIDATE"
                    ? "bg-white text-black shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Candidate / Student</span>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "RECRUITER" ? "Jane Doe (HR Manager)" : "Alex Morgan (Computer Science Student)"}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111111] border border-[#222222] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "RECRUITER" ? "recruiter@company.com" : "candidate@university.edu"}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111111] border border-[#222222] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111111] border border-[#222222] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111111] border border-[#222222] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            )}

            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold">
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : mode === "login" ? (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span>Sign In as {role === "RECRUITER" ? "Recruiter" : "Candidate"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span>Create {role === "RECRUITER" ? "Recruiter" : "Candidate"} Account</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Switch Mode Prompt Footer */}
          <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-[#1a1a1a]">
            {mode === "login" ? (
              <p>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMessage("");
                  }}
                  className="text-white font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage("");
                  }}
                  className="text-white font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-500">Loading Authentication...</div>}>
      <AuthForm />
    </Suspense>
  );
}
