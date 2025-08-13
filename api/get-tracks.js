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
  try {
    const token = await getAccessToken();
    const playlistRes = await fetch(`${SPOTIFY_API}/playlists/${process.env.SOURCE_PLAYLIST_ID}/tracks`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const playlistData = await playlistRes.json();

    const tracks = playlistData.items.map(item => ({
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(", "),
      uri: item.track.uri,
      image: item.track.album.images[0]?.url || ""
    }));

    res.status(200).json(tracks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch source playlist", details: err.message });
  }
}
