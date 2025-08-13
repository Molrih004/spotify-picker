import express from "express";
const app = express();

const client_id = "d87f93dd580b4aa5a289507270c33003"; 
const redirect_uri = "https://7d831ad34d28.ngrok-free.app/callback"; // change this

app.get("/login", (req, res) => {
  const scope = "playlist-modify-public playlist-modify-private";
  const url =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id,
      scope,
      redirect_uri,
    });

  res.redirect(url);
});

app.listen(3000, () => console.log("Auth server running on port 3000"));
