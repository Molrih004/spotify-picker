// api/add-song.js
import fetch from "node-fetch";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const PLAYLIST_ID = process.env.PLAYLIST_ID;

async function getAccessToken() {
  try {
    const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: REFRESH_TOKEN,
      }),
    });

    const text = await res.text();
    console.log("Refresh token response:", text);

    if (!res.ok) throw new Error("Could not refresh access token");

    const data = JSON.parse(text);
    return data.access_token;
  } catch (err) {
    console.error("Error getting access token:", err);
    throw err;
  }
}

export default async function handler(req, res) {
  console.log("Incoming request to /api/add-song");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { songUri } = req.body;
  if (!songUri) {
    return res.status(400).json({ error: "Missing songUri in request body" });
  }

  try {
    const accessToken = await getAccessToken();
    console.log("Access token (partial):", accessToken?.substring(0, 10) + "...");

    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [songUri] }),
      }
    );

    const spotifyText = await spotifyRes.text();
    console.log("Spotify add-song response:", spotifyText);

    if (!spotifyRes.ok) {
      return res.status(spotifyRes.status).json({ error: "Spotify API error", details: spotifyText });
    }

    res.status(200).json({ success: true });
    console.log(`Successfully added track ${songUri} to playlist`);
  } catch (err) {
    console.error("Unexpected error in /api/add-song:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
