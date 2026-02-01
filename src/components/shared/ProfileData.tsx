"use client";
import { useEffect, useState } from "react";
import { betterAuth } from "better-auth";

const auth = betterAuth({ baseURL: "http://localhost:5000" });

export default function UserSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await auth.api.getSession({
          headers: { cookie: document.cookie }, // send browser cookies
        });
        setSession(data);
        console.log("SessionData:", data);
      } catch (err) {
        console.error("APIError:", err);
      }
    };

    fetchSession();
  }, []);

  if (!session) return <p>Loading...</p>;

  return (
    <div>
      <p>User ID: {session.user.id}</p>
      <p>Name: {session.user.name}</p>
    </div>
  );
}
