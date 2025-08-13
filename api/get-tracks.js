import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
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

    const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${process.env.PLAYLIST_ID}/tracks`, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    const playlistData = await playlistRes.json();

    const tracks = playlistData.items.map(item => ({
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(", "),
      image: item.track.album.images[0]?.url || "",
      uri: item.track.uri
    }));

    res.status(200).json(tracks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch playlist tracks", details: err.message });
  }
}
