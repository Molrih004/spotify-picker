import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: "No query provided" });

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

    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    const tracks = searchData.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      image: track.album.images[0]?.url || "",
      uri: track.uri
    }));

    res.status(200).json(tracks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
