"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Banner from "../components/Banner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    toast("You can use admin in username and password for testing!", {
      duration: 3000,
      style: {
        background: "lightgreen",
        //color: "white", // white text
        //fontFamily: "Arial, sans-serif",
        fontSize: "21px",
      },
    });
  }, []);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard"); // ✅ redirect to dashboard
      //toast("Login Successful!");
      toast("Log In Successful!", {
        duration: 3000,
        style: {
          background: "lightgreen",
          //color: "white", // white text
          //fontFamily: "Arial, sans-serif",
          fontSize: "21px",
        },
      });
    } else {
      //alert("Invalid credentials");
      toast("Invalid Credentials!", {
        duration: 3000,
        style: {
          background: "red",
          color: "white", // white text
          //fontFamily: "Arial, sans-serif",
          fontSize: "21px",
        },
      });
    }
  };

  return (
    <div className="login-div wrapper w-full pb-16">
      <Banner />
      <form
        onSubmit={handleSubmit}
        className="login-form space-y-4 max-w-md mx-auto mt-10 border rounded shadow-md bg-gray-100 pt-6 pb-10 px-8"
      >
        <h2 className="text-xl sm:text-3xl mx-auto text-center font-bold">
          Log In
        </h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full border p-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border p-2"
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 hover:bg-green-300"
          onClick={()=>setLoading(true)}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
