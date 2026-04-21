"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={() => {
        setLoading(true);
        signOut({ callbackUrl: "/" });
      }}
      className="logout-btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
