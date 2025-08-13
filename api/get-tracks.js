// api/get-tracks.js
import fetch from "node-fetch";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const SOURCE_PLAYLIST_ID = process.env.SOURCE_PLAYLIST_ID; // Playlist to pick songs from

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
  console.log("Incoming request to /api/get-tracks");

  try {
    const accessToken = await getAccessToken();
    console.log("Access token (partial):", accessToken?.substring(0, 10) + "...");

    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/playlists/${SOURCE_PLAYLIST_ID}/tracks?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const spotifyText = await spotifyRes.text();
    console.log("Spotify playlist response:", spotifyText);

    if (!spotifyRes.ok) {
      return res.status(spotifyRes.status).json({ error: "Spotify API error", details: spotifyText });
    }

    const data = JSON.parse(spotifyText);
    const tracks = data.items
      .filter(item => item.track)
      .map(item => ({
        name: item.track.name,
        artist: item.track.artists.map(a => a.name).join(", "),
        image: item.track.album.images[0]?.url || "",
        uri: item.track.uri,
      }));

    console.log(`Returning ${tracks.length} tracks`);
    res.status(200).json(tracks);
  } catch (err) {
    console.error("Unexpected error in /api/get-tracks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
