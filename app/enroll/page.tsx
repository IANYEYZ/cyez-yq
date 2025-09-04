"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function EnrollPage() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const code = (form.elements.namedItem("code") as HTMLInputElement).value.trim().toUpperCase();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      setBusy(false);
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setBusy(false);
      setError(j?.error ?? "Enrollment failed");
      return;
    }

    // Auto sign-in
    const si = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setBusy(false);
    if (si?.error) {
      // Shouldn't happen, but fallback to login page
      window.location.href = "/login";
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">学生注册</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">学校邮箱</label>
          <input name="email" type="email" required className="mt-1 block w-full rounded border-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium">注册码</label>
          <input name="code" required placeholder="ABCD-1234" className="mt-1 block w-full rounded border-gray-300 uppercase" />
        </div>
        <div>
          <label className="block text-sm font-medium">新密码</label>
          <input name="password" type="password" required className="mt-1 block w-full rounded border-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium">确认密码</label>
          <input name="confirm" type="password" required className="mt-1 block w-full rounded border-gray-300" />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={busy} className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50">
          {busy ? "注册中..." : "注册并登录"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        已注册？<a className="underline" href="/login">直接登录</a>。
      </p>
    </div>
  );
}
