import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const SPOTIFY_API = "https://api.spotify.com/v1";

async function getAccessToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.REFRESH_TOKEN
    })
  });
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { songUri } = req.body;
  if (!songUri) return res.status(400).json({ error: "No songUri provided" });

  try {
    const token = await getAccessToken();
    const addRes = await fetch(`${SPOTIFY_API}/playlists/${process.env.MY_PLAYLIST_ID}/tracks?uris=${songUri}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!addRes.ok) throw new Error("Failed to add song");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add song", details: err.message });
  }
}
