import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { songUri } = req.body;

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString("base64")
      },
      body: `grant_type=refresh_token&refresh_token=${process.env.REFRESH_TOKEN}`
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const addRes = await fetch(`https://api.spotify.com/v1/playlists/${process.env.PLAYLIST_ID}/tracks?uris=${encodeURIComponent(songUri)}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (!add
