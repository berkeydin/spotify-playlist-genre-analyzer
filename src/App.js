import { useState, useEffect } from "react";
import { setAccessToken } from "./services/spotifyService";
import Login from "./components/Login";
import PlaylistSelector from "./components/PlaylistSelector";
import GenreAnalyzer from "./components/GenreAnalyzer";
import "./styles/global.css";

function App() {
  const [token, setToken] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // URL'den hash'i al
    const hash = window.location.hash
      .substring(1)
      .split("&")
      .reduce((initial, item) => {
        const parts = item.split("=");
        initial[parts[0]] = decodeURIComponent(parts[1]);
        return initial;
      }, {});

    // URL'i temizle
    window.location.hash = "";

    // Token'ı kontrol et
    const _token = hash.access_token;
    if (_token) {
      // Token'ı localStorage'a kaydet ve Spotify API'ye ayarla
      localStorage.setItem("spotify_access_token", _token);
      setToken(_token);
      setAccessToken(_token);
    } else {
      // LocalStorage'dan token'ı kontrol et
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) {
        setToken(storedToken);
        setAccessToken(storedToken);
      }
    }
  }, []);

  const handlePlaylistSelect = (playlist) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedPlaylist(playlist);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    setSelectedPlaylist(null);
  };

  if (!token) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-spotify-black text-spotify-text">
      <main>
        {!selectedPlaylist ? (
          <div
            className={`transition-opacity duration-300 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            <PlaylistSelector onSelect={handlePlaylistSelect} />
          </div>
        ) : (
          <GenreAnalyzer playlist={selectedPlaylist} onBack={handleBack} />
        )}
      </main>
    </div>
  );
}

export default App;
