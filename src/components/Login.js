import { getAuthUrl } from "../services/spotifyService";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-black via-spotify-darkgray to-spotify-black flex items-center justify-center p-4">
      <div className="bg-spotify-card max-w-md w-full p-8 rounded-xl shadow-spotify-xl">
        <div className="flex flex-col items-center space-y-8">
          {/* Spotify Logo */}
          <div className="w-64 relative mb-4">
            <img
              src="/spotify-white.png"
              alt="Spotify"
              className="w-full object-contain"
            />
          </div>

          {/* Başlık */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-spotify-green to-spotify-secondary bg-clip-text text-transparent">
              Playlist Analyzer
            </h1>
            <p className="text-spotify-text-subdued text-lg">
              Playlistlerini türlere göre analiz et ve düzenle
            </p>
          </div>

          {/* Giriş Butonu */}
          <a
            href={getAuthUrl()}
            className="w-full bg-spotify-green hover:bg-spotify-secondary text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-spotify hover:shadow-spotify-lg flex items-center justify-center"
          >
            <span className="text-lg font-semibold">Spotify ile Giriş Yap</span>
          </a>

          {/* Alt Bilgi */}
          <div className="text-center space-y-4">
            <p className="text-sm text-spotify-text-subdued">
              Spotify hesabınla giriş yaparak playlistlerini analiz edebilir ve
              türlere göre yeni playlistler oluşturabilirsin.
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-spotify-text-subdued">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Spotify Premium hesabı gereklidir</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
