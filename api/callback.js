import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code received.");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString("base64"),
    },
    body: new URLSearchParams({
      code,
      redirect_uri: "https://7d831ad34d28.ngrok-free.app/callback", // your ngrok URL
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();
  console.log("Refresh Token:", data.refresh_token);
  res.send("Check server console for your refresh token!");
});

app.listen(3000, () => console.log("Callback server running on port 3000"));
