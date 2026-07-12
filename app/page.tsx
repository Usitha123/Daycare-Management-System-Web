"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  School,
} from "lucide-react";

const ROLE_ROUTE: Record<string, string> = {
  admin: "/admindashboard",
  manager: "/managerdashboard",
  teacher: "/teacherdashboard",
  caregiver: "/caregiverdashboard",
  parent: "/parentdashboard",
};

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("No user returned from authentication.");
      }

      // Fetch user's role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Could not determine user role.");
      }

      const role = profile.role as string;
      const dashboardPath = ROLE_ROUTE[role];

      if (!dashboardPath) {
        throw new Error(`No dashboard found for role: ${role}`);
      }

      router.push(dashboardPath);
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-200/40 dark:bg-indigo-950/20 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-pink-200/40 dark:bg-pink-950/20 blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-8 shadow-xl shadow-zinc-100 dark:shadow-none">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 shadow-inner mb-4">
              <School className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 text-center">
              Daycare System
            </h1>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center">
              Daycare Management System
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>

                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <KeyRound className="h-4 w-4" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
