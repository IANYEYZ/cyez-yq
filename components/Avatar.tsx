// components/Avatar.tsx
"use client";

import { useState } from "react";
import { gravatarUrl } from "@/lib/gravatar";

export default function Avatar({
  email,
  name,
  size = 40,
  className = "",
  rounded = true,
  defaultStyle = "identicon",
}: {
  email?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  rounded?: boolean;
  defaultStyle?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = gravatarUrl(email, size * 2, defaultStyle);
  const initials =
    (name ?? email ?? "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "?";

  const wrapperClasses = `${rounded ? "rounded-full" : "rounded"} inline-flex items-center justify-center bg-gray-200 text-gray-700 overflow-hidden ${className}`;

  return (
    <span
      className={wrapperClasses}
      style={{ width: size, height: size, lineHeight: `${size}px` }}
      aria-label={name ?? email ?? "avatar"}
      title={name ?? email ?? ""}
    >
      {!imgFailed ? (
        // show image; onError flips to initials fallback
        <img
          src={url}
          alt={name ?? email ?? "avatar"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        // initials fallback
        <span className="text-sm font-medium select-none">{initials}</span>
      )}
    </span>
  );
}
