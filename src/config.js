const isDevelopment = process.env.NODE_ENV === "development";

export const config = {
  clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  redirectUri: isDevelopment
    ? "http://localhost:3000"
    : process.env.REACT_APP_REDIRECT_URI,
  scopes: [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
  ],
};

// Client secret'ı güvenli bir şekilde saklayın - asla doğrudan kodda tutmayın
export const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
