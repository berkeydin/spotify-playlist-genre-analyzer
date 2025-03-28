import { useState, useEffect, useRef } from "react";
import {
  getPlaylistTracks,
  getTrackGenres,
  createPlaylist,
  addTracksToPlaylist,
  followPlaylist,
  handleSpotifyError,
} from "../services/spotifyService";
import ScrollToTop from "./ScrollToTop";

const GenreAnalyzer = ({ playlist, onBack }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [genreGroups, setGenreGroups] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [createdPlaylists, setCreatedPlaylists] = useState({});
  const [isLeaving, setIsLeaving] = useState(false);

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onBack();
    }, 300);
  };

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const playlistTracks = await getPlaylistTracks(playlist.id);
        setTracks(playlistTracks);
      } catch (error) {
        setError("Şarkılar yüklenirken bir hata oluştu.");
        console.error("Şarkılar yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [playlist.id]);

  useEffect(() => {
    if (tracks) {
    }
  }, [tracks]);

  const analyzeTracks = async () => {
    setAnalyzing(true);
    setProgress(0);

    try {
      if (!tracks || !Array.isArray(tracks)) {
        setError("Şarkı listesi yüklenemedi.");
        return;
      }

      const results = [];
      let successCount = 0;

      for (let i = 0; i < tracks.length; i++) {
        const trackItem = tracks[i];
        const track = trackItem.track;

        if (!track || !track.id) {
          continue;
        }

        try {
          const genres = await getTrackGenres(track.id);

          if (genres && genres.length > 0) {
            successCount++;
            results.push({
              id: track.id,
              name: track.name,
              artists: track.artists,
              album: track.album,
              uri: track.uri,
              genres: genres,
            });
          }

          setProgress(((i + 1) / tracks.length) * 100);
        } catch (trackError) {
          // Hata durumunda sessizce devam et
        }
      }

      if (successCount === 0) {
        setError(
          "Hiçbir şarkının türü analiz edilemedi. Lütfen daha sonra tekrar deneyin."
        );
        return;
      }

      organizeGenres(results);
    } catch (error) {
      setError("Analiz sırasında bir hata oluştu.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreatePlaylist = async (genre, tracks) => {
    setError(null);
    try {
      // Yükleniyor durumunu göster
      setError("Playlist oluşturuluyor...");

      const newPlaylist = await createPlaylist(
        `${playlist.name} - ${genre}`,
        `${playlist.name} playlistinden ${genre} türündeki şarkılar`
      );

      // Şarkıları eklerken durumu güncelle
      const totalTracks = tracks.length;
      setError(`Şarkılar ekleniyor... (${totalTracks} şarkı)`);

      const trackUris = tracks.map((track) => track.uri);
      await addTracksToPlaylist(newPlaylist.id, trackUris);

      // Başarılı mesajını göster
      setError(
        <div className="bg-green-900/30 border border-green-500/50 text-green-100 px-6 py-4 rounded-lg mb-8">
          ✅ Playlist başarıyla oluşturuldu! {totalTracks} şarkı eklendi.
          Spotify'da "{playlist.name} - {genre}" olarak görüntüleyebilirsiniz.
        </div>
      );

      setCreatedPlaylists((prev) => ({
        ...prev,
        [genre]: newPlaylist.id,
      }));

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setError(null);
      }, 3000);

      return true;
    } catch (error) {
      setError(handleSpotifyError(error));
      return false;
    }
  };

  const handleFollowPlaylist = async (genre, playlistId) => {
    try {
      await followPlaylist(playlistId);
      setError(null);
    } catch (error) {
      setError(handleSpotifyError(error));
    }
  };

  const organizeGenres = (results) => {
    try {
      const genreMap = {};

      results.forEach((track) => {
        track.genres.forEach((genre) => {
          if (!genreMap[genre]) {
            genreMap[genre] = [];
          }
          genreMap[genre].push(track);
        });
      });

      // Convert to array and sort by number of tracks
      const sortedGenres = Object.entries(genreMap)
        .map(([genre, tracks]) => ({
          genre,
          tracks,
          length: tracks.length,
        }))
        .sort((a, b) => b.length - a.length);

      setGenreGroups(sortedGenres);
    } catch (error) {
      console.error("Genre organization error:", error);
      setError("Türler organize edilirken bir hata oluştu: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-spotify-green"></div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-spotify-dark overflow-y-auto transition-opacity duration-300 ${
        isLeaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ maxHeight: "100vh" }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Geri Tuşu ve Playlist Başlığı */}
          <div className="bg-gradient-to-b from-spotify-lightgray to-spotify-dark rounded-2xl p-6 mb-8 shadow-spotify-lg">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleBack}
                className="bg-spotify-dark hover:bg-spotify-hover text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110 group"
              >
                <svg
                  className="w-8 h-8 transform transition-transform duration-300 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <img
                src={playlist.images[0]?.url || "/placeholder.png"}
                alt={playlist.name}
                className="w-32 h-32 rounded-xl shadow-spotify"
              />
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {playlist.name}
                </h2>
                <p className="text-spotify-muted text-lg">
                  {tracks.length} şarkı
                </p>
              </div>
            </div>
          </div>

          {/* Hata/Başarı Mesajı */}
          {error && (
            <div className="mb-8">
              {typeof error === "string" ? (
                <div className="bg-red-900/30 border border-red-500/50 text-red-100 px-6 py-4 rounded-lg">
                  {error}
                </div>
              ) : (
                error
              )}
            </div>
          )}

          {/* Analiz Butonu veya Progress */}
          {!analyzing && genreGroups.length === 0 && (
            <button
              onClick={analyzeTracks}
              className="w-full bg-spotify-green hover:bg-spotify-secondary text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-spotify hover:shadow-spotify-lg flex items-center justify-center space-x-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>Türlere Göre Analiz Et</span>
            </button>
          )}

          {analyzing && (
            <div className="bg-spotify-lightgray rounded-xl p-6 mb-8 shadow-spotify">
              <div className="mb-4">
                <div className="h-2 bg-spotify-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-spotify-green transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-center text-spotify-muted">
                Şarkılar analiz ediliyor... (%{Math.round(progress)})
              </p>
            </div>
          )}

          {/* Tür Grupları ve Şarkı Listeleri */}
          {genreGroups.length > 0 && (
            <div className="space-y-4">
              {genreGroups.map(({ genre, tracks, length }) => (
                <div
                  key={genre}
                  className="bg-spotify-lightgray rounded-xl overflow-hidden shadow-spotify hover:shadow-spotify-lg transition-all duration-300"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-spotify-hover transition-colors duration-200"
                    onClick={() =>
                      setSelectedGenre(selectedGenre === genre ? null : genre)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <svg
                        className={`w-5 h-5 text-spotify-green transform transition-transform duration-300 ${
                          selectedGenre === genre ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {genre}
                        </h3>
                        <p className="text-spotify-muted text-sm">
                          {length} şarkı
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {createdPlaylists[genre] ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowPlaylist(
                              genre,
                              createdPlaylists[genre]
                            );
                          }}
                          className="bg-spotify-dark hover:bg-spotify-hover text-white px-4 py-2 rounded-full text-sm transition-colors duration-300 flex items-center space-x-2"
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span>Kitaplığa Ekle</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatePlaylist(genre, tracks);
                          }}
                          className="bg-spotify-green hover:bg-spotify-secondary text-white px-4 py-2 rounded-full text-sm transition-colors duration-300 flex items-center space-x-2"
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <span>Playlist Oluştur</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Şarkı Listesi */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      selectedGenre === genre
                        ? "max-h-[50000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-4 space-y-2">
                      {tracks.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center space-x-4 p-2 hover:bg-spotify-hover rounded-lg transition-colors duration-200"
                        >
                          <img
                            src={
                              track.album.images[2]?.url || "/placeholder.png"
                            }
                            alt={track.name}
                            className="w-10 h-10 rounded shadow-spotify"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white truncate">{track.name}</p>
                            <p className="text-spotify-muted text-sm truncate">
                              {track.artists.map((a) => a.name).join(", ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ScrollToTop containerRef={containerRef} />
    </div>
  );
};

export default GenreAnalyzer;
