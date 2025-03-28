import { useState, useEffect, useRef } from "react";
import { getUserPlaylists, logout } from "../services/spotifyService";
import ScrollToTop from "./ScrollToTop";

const PlaylistSelector = ({ onSelect }) => {
  const containerRef = useRef(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const userPlaylists = await getUserPlaylists();
        setPlaylists(userPlaylists.rootPlaylists || []);
      } catch (error) {
        setError("Playlistler yüklenirken bir hata oluştu.");
        console.error("Playlist yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const filteredPlaylists = searchTerm
    ? playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : playlists;

  if (loading) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-spotify-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-spotify-black p-4 flex items-center justify-center">
        <div className="bg-spotify-card p-8 rounded-lg text-center max-w-md w-full">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-spotify-text-primary mb-2">
            {error}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-spotify-green hover:bg-spotify-secondary text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-spotify-black to-spotify-darker overflow-y-auto"
      style={{ maxHeight: "100vh" }}
    >
      <div className="bg-spotify-black bg-opacity-90 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/spotify-white.png"
                alt="Spotify"
                className="h-8 object-contain"
              />
              <h1 className="text-2xl font-bold text-spotify-text-primary">
                Playlist Analyzer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-96">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Playlist ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-spotify-darkgray text-spotify-text-primary placeholder-spotify-text-subdued px-12 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green transition-all duration-300"
                  />
                  <svg
                    className="w-5 h-5 text-spotify-text-subdued absolute left-4 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm transition-colors duration-300 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onSelect={onSelect}
            />
          ))}
        </div>

        {/* Boş durum */}
        {filteredPlaylists.length === 0 && (
          <div className="text-center text-spotify-text-subdued mt-16">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg">
              {searchTerm
                ? "Aradığınız playlist bulunamadı."
                : "Hiç playlist bulunamadı."}
            </p>
          </div>
        )}
      </div>
      <ScrollToTop containerRef={containerRef} />
    </div>
  );
};

// Playlist Card Component
const PlaylistCard = ({ playlist, onSelect }) => {
  // Playlist resmi için varsayılan değer
  const playlistImage =
    playlist?.images?.[0]?.url || "/playlist-placeholder.png";

  return (
    <div
      onClick={() => onSelect(playlist)}
      className="group bg-spotify-card hover:bg-spotify-hover p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105"
    >
      <div className="relative aspect-square mb-4">
        <img
          src={playlistImage}
          alt={playlist.name}
          className="w-full h-full object-cover rounded-md shadow-spotify"
        />
      </div>
      <h3 className="font-bold text-spotify-text-primary truncate">
        {playlist.name}
      </h3>
      <p className="text-sm text-spotify-text-subdued mt-1">
        {playlist.tracks.total} şarkı
      </p>
    </div>
  );
};

export default PlaylistSelector;
