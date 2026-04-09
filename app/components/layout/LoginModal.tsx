"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth/context";
import { ButtonSpinner } from "@/app/components/atoms/ButtonSpinner";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface AuthForm {
  email: string;
  password: string;
}

const inputClass =
  "w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary";

export function LoginModal({ open, onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AuthForm>();

  useEffect(() => {
    if (open) {
      setError(null);
      setTab("signin");
      reset();
      setTimeout(() => {
        formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
      }, 50);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function switchTab(t: "signin" | "signup") {
    setTab(t);
    setError(null);
    reset();
  }

  async function onSubmit(values: AuthForm) {
    setError(null);
    try {
      if (tab === "signin") {
        await signIn(values.email, values.password);
      } else {
        await signUp(values.email, values.password);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-text/20 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-xl border border-border bg-bg shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? "text-text border-b-2 border-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Email</label>
            <input
              {...register("email", { required: true })}
              type="email"
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">Password</label>
            <input
              {...register("password", { required: true })}
              type="password"
              autoComplete={tab === "signin" ? "current-password" : "new-password"}
              className={inputClass}
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-bg transition-colors hover:opacity-80 disabled:opacity-50"
          >
            {isSubmitting && <ButtonSpinner className="h-4 w-4" />}
            {tab === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
