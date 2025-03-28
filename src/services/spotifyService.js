import SpotifyWebApi from "spotify-web-api-node";
import { config, clientSecret } from "../config";

const spotifyApi = new SpotifyWebApi({
  clientId: config.clientId,
  clientSecret: clientSecret,
  redirectUri: config.redirectUri,
});

// Token alma fonksiyonunu ekleyelim
const getClientCredentialsToken = async () => {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(config.clientId + ":" + clientSecret),
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem("spotify_access_token", data.access_token);
      spotifyApi.setAccessToken(data.access_token);
      return data.access_token;
    } else {
      throw new Error("Token alınamadı");
    }
  } catch (error) {
    console.error("Token alma hatası:", error);
    throw error;
  }
};

export const getAuthUrl = () => {
  return `https://accounts.spotify.com/authorize?client_id=${
    config.clientId
  }&response_type=token&redirect_uri=${encodeURIComponent(
    config.redirectUri
  )}&scope=${encodeURIComponent(config.scopes.join(" "))}&show_dialog=true`;
};

export const setAccessToken = async (token) => {
  if (!token) {
    try {
      token = await getClientCredentialsToken();
    } catch (error) {
      console.error("Token alma hatası:", error);
      window.location.href = "/";
      return;
    }
  }

  try {
    spotifyApi.setAccessToken(token);
    localStorage.setItem("spotify_access_token", token);

    // Token'ın geçerli olup olmadığını kontrol et
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token geçersiz");
    }
  } catch (error) {
    console.error("Token doğrulama hatası:", error);
    localStorage.removeItem("spotify_access_token");
    window.location.href = "/";
  }
};

export const getUserPlaylists = async () => {
  try {
    const data = await spotifyApi
      .getUserPlaylists({ limit: 50 })
      .then((data) => data.body);
    return {
      rootPlaylists: data.items || [],
    };
  } catch (error) {
    if (error.statusCode === 401) {
      window.location.href = "/";
    }
    return { rootPlaylists: [] };
  }
};

export const getPlaylistTracks = async (playlistId) => {
  try {
    let tracks = [];
    let offset = 0;
    const limit = 100;
    let total = 1;

    while (offset < total) {
      const data = await spotifyApi
        .getPlaylistTracks(playlistId, {
          offset: offset,
          limit: limit,
        })
        .then((data) => data.body);

      tracks = [...tracks, ...data.items];
      total = data.total;
      offset += limit;
    }

    return tracks;
  } catch (error) {
    if (error.statusCode === 401) {
      window.location.href = "/";
    }
    return [];
  }
};

export const getTrackGenres = async (trackId) => {
  try {
    if (!spotifyApi.getAccessToken()) {
      window.location.href = "/";
      return ["Diğer"];
    }

    const track = await spotifyApi.getTrack(trackId);

    if (!track || !track.body) {
      return ["Diğer"];
    }

    const artist = await spotifyApi.getArtist(track.body.artists[0].id);

    if (!artist || !artist.body || !artist.body.genres) {
      return ["Diğer"];
    }

    return artist.body.genres.length > 0 ? artist.body.genres : ["Diğer"];
  } catch (error) {
    if (error.statusCode === 401) {
      window.location.href = "/";
    }
    return ["Diğer"];
  }
};

export const createPlaylist = async (name, description) => {
  try {
    // Token kontrolü
    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      throw new Error("Token bulunamadı");
    }

    // Önce kullanıcı ID'sini alalım
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Kullanıcı bilgileri alınamadı");
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Playlist oluşturma isteği
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          description: description,
          public: false,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Playlist oluşturma hatası:", errorData);
      throw new Error(errorData.error?.message || "Playlist oluşturulamadı");
    }

    const playlistData = await response.json();
    return playlistData;
  } catch (error) {
    console.error("Playlist oluşturma hatası:", error);
    throw error;
  }
};

export const addTracksToPlaylist = async (playlistId, trackUris) => {
  try {
    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      throw new Error("Token bulunamadı");
    }

    // Şarkıları 100'erli gruplara böl
    const chunkSize = 100;
    const trackChunks = [];
    for (let i = 0; i < trackUris.length; i += chunkSize) {
      trackChunks.push(trackUris.slice(i, i + chunkSize));
    }

    // Her bir grubu sırayla ekle
    for (const chunk of trackChunks) {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: chunk,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Şarkı ekleme hatası:", errorData);
        throw new Error(errorData.error?.message || "Şarkılar eklenemedi");
      }

      // Her chunk arasında kısa bir bekleme süresi ekle
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return { snapshot_id: "success" };
  } catch (error) {
    console.error("Şarkı ekleme hatası:", error);
    throw error;
  }
};

export const followPlaylist = async (playlistId) => {
  try {
    await spotifyApi.followPlaylist(playlistId);
    return true;
  } catch (error) {
    if (error.statusCode === 401) {
      window.location.href = "/";
    }
    throw error;
  }
};

export const logout = () => {
  spotifyApi.setAccessToken(null);

  const spotifyLogoutUrl = "https://accounts.spotify.com/logout";

  const popup = window.open(
    spotifyLogoutUrl,
    "Spotify Logout",
    "width=700,height=500,top=40,left=40"
  );

  setTimeout(() => {
    if (popup) {
      popup.close();
    }
    window.location.replace("/");
  }, 2000);
};

export const handleSpotifyError = (error) => {
  if (error.statusCode === 401 || error.statusCode === 403) {
    window.location.href = "/";
    return "Oturum süresi dolmuş";
  }

  if (error.statusCode === 502) {
    return "Spotify servisi geçici olarak kullanılamıyor";
  }

  return error.message;
};
