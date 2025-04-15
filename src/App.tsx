import React, { useState } from "react";
import { Download, ArrowRight, Video, Music, Loader2 } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface MediaPreview {
  type?: "image" | "video";
  url?: string;
  thumbnail?: string;
}

interface VideoPreview {
  thumbnail?: string;
  title?: string;
  description?: string;
  duration?: string;
  author?: string;
  resolutions?: Resolution[];
  media?: MediaPreview[];
  videoUrl?: string;
  audioUrl?: string;
}

interface Resolution {
  label: string;
  value: string;
}

function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadType, setDownloadType] = useState<"video" | "audio" | null>(
    null
  );

  const resolutions: Resolution[] = [
    { label: "1080p", value: "1080" },
    { label: "720p", value: "720" },
    { label: "480p", value: "480" },
    { label: "360p", value: "360" },
  ];

  function checkUrl(url: string): boolean {
  const patterns = [
    /^(https?:\/\/)?(www\.|m\.|vm\.|vt\.)?(youtube\.com|youtu\.?be)\/.+$/i,
    /^(https?:\/\/)?(www\.|m\.|fb\.)?(facebook\.com|fb\.me)\/.+$/i,
    /^(https?:\/\/)?(www\.|m\.)?(instagram\.com|instagr\.am)\/.+$/i,
    /^(https?:\/\/)?(www\.|m\.|vm\.|vt\.)?(tiktok\.com)\/.+$/i
  ];

  return patterns.some((regex) => regex.test(url));
}

function matchLink(url: string): string {
  if (/^(https?:\/\/)?(www\.|m\.|vm\.|vt\.)?(youtube\.com|youtu\.?be)\/.+$/i.test(url)) {
    return "YouTube";
  } else if (/^(https?:\/\/)?(www\.|m\.|fb\.)?(facebook\.com|fb\.me)\/.+$/i.test(url)) {
    return "Facebook";
  } else if (/^(https?:\/\/)?(www\.|m\.)?(instagram\.com|instagr\.am)\/.+$/i.test(url)) {
    return "Instagram";
  } else if (/^(https?:\/\/)?(www\.|m\.|vm\.|vt\.)?(tiktok\.com)\/.+$/i.test(url)) {
    return "TikTok";
  }
  return "";
}

  const getVideoIdFromUrl = (url: String) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!checkUrl(url)) {
      alert("Please enter a valid YouTube, Facebook, or Instagram URL.");
      setLoading(false);
      return;
    }

    switch (matchLink(url)) {
      case "YouTube":
        try {
          setLoading(true);
          const videoId = getVideoIdFromUrl(url);
          if (!videoId) {
            alert("Invalid YouTube URL");
            setLoading(false);
            return;
          }

          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=AIzaSyDMCgZsBsxn_OSUcJUx8nYBIwYLd644T9Y&part=snippet,contentDetails`;

          try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.items && data.items.length > 0) {
              const videoDetails = data.items[0];
              const snippet = videoDetails.snippet;
              const { thumbnails, title, description } = snippet;
              const { duration } = videoDetails.contentDetails;
              const videoDuration = duration
                .replace("PT", "")
                .replace("H", ":");
              const formattedDuration = videoDuration
                .replace("M", ":")
                .replace("S", "")
                .replace(/:$/, "");
              const formattedThumbnail = thumbnails.high.url;
              const author = snippet.channelTitle;
              setPreview({
                thumbnail: formattedThumbnail,
                title: title,
                description: description,
                duration: formattedDuration,
                author: author,
              });
            }
          } catch (error) {
            console.error("Error fetching video info:", error);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching YouTube video info:", error);
          alert("Failed to fetch video information.");
        }
        break;
      case "Facebook":
        try {
          setLoading(true);
          const apiUrl = `https://api.neoxr.eu/api/fb?url=${url}&apikey=KFmhZV`;
          const response = await axios.get(apiUrl);
          const data = response.data;

          setPreview({
            thumbnail:
              "https://cdn6.aptoide.com/imgs/c/3/c/c3c4f8e3316d67a4c6568e2cc502e5cb_icon.png",
            title: url,
            description: "Facebook Video Downloader",
            duration: "-",
            author: "alvio adji januar",
            resolutions: data.data.map((res: any) => ({
              label: res.quality,
              value: res.url,
            })),
          });

          setLoading(false);
        } catch (error) {
          console.error("Error fetching Facebook video info:", error);
          alert("Failed to fetch video information.");
          setLoading(false);
        }
        break;
      case "Instagram":
        try {
          setLoading(true);
          const apiUrl = `https://api.neoxr.eu/api/ig?url=${url}&apikey=KFmhZV`;
          const response = await axios.get(apiUrl);

          const media = response.data.data.map((item: any) => ({
            type: item.type === "jpg" ? "image" : "video",
            url: item.url,
            thumbnail: item.thumbnail || item.url,
          }));

          setPreview({
            media: media,
            title: `Instagram Media (${media.length} files)`,
            author: "Instagram User",
          });

          setLoading(false);
        } catch (error) {
          console.error("Error fetching Instagram media:", error);
          alert("Failed to fetch media information.");
          setLoading(false);
        }
        break;
      case "TikTok":
        try {
          setLoading(true);
          const apiUrl = `https://api.neoxr.eu/api/tiktok?url=${url}&apikey=KFmhZV`;
          const response = await axios.get(apiUrl);
          const data = response.data.data;

          setPreview({
            thumbnail: data.author.avatar_thumb.url_list[0],
            title: data.caption || "TikTok Video",
            description: data.music.title,
            duration: `${data.music.duration}s`,
            author: data.author.nickname,
            videoUrl: data.video,
            audioUrl: data.audio,
          });

          setLoading(false);
        } catch (error) {
          console.error("Error fetching TikTok video info:", error);
          alert("Failed to fetch video information.");
          setLoading(false);
        }
        break;
    }
  };

  const handleDownload = async (resolution?: string, key?: string) => {
    setDownloading(true);
    try {
      if (matchLink(url) == "YouTube") {
        const endpoint =
          key === "youtube-audio"
            ? `https://api.neoxr.eu/api/youtube?url=${url}&type=audio&quality=128kbps&apikey=KFmhZV`
            : `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=${resolution}&apikey=KFmhZV`;

        const { data } = await axios.get(endpoint);

        if (!data.data.url) {
          throw new Error("Invalid download URL");
        }

        const a = document.createElement("a");
        a.href = data.data.url;
        a.download = `${preview?.title}${
          key === "youtube-audio" ? ".mp3" : ".mp4"
        }`;
        a.click();

        toast.success("Download started successfully!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (matchLink(url) == "Facebook") {
        const endpoint = `https://api.neoxr.eu/api/fb?url=${url}&apikey=KFmhZV`;

        const { data } = await axios.get(endpoint);

        if (!data.data.find((res: any) => res.quality === resolution)?.url) {
          throw new Error("Invalid download URL");
        }

        const a = document.createElement("a");
        a.href = data.data.find((res: any) => res.quality === resolution)?.url;
        a.download = `${preview?.title}.mp4`;
        a.click();

        toast.success("Download started successfully!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (matchLink(url) == "Instagram") {
        const media = preview?.media?.find((item) => item.url === resolution);
        if (!media || !media.url) {
          throw new Error("Invalid media URL");
        }

        const a = document.createElement("a");
        a.href = media.url;
        a.download = `${preview?.title}-${media.type}.${media.type}`;
        a.click();

        toast.success("Download started successfully!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        const downloadUrl = key === "audio" ? preview?.audioUrl : preview?.videoUrl;
        if (!downloadUrl) {
          throw new Error("No download URL available");
        }
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${preview?.title}${key === "audio" ? ".mp3" : ".mp4"}`;
        a.click();
        toast.success("Download started successfully!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      toast.error("Download failed. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFF86] p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Header */}
      <header className="max-w-screen-md mx-auto mb-12 sm:mb-16 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-2 transform -rotate-2">
          <span className="bg-[#FF8DC7] px-4 py-2 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Social Video Grabber
          </span>
        </h1>
        <p className="text-base sm:text-xl bg-white p-4 inline-block transform rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Download videos from YouTube, Facebook, Instagram & TikTok! ✨
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-md mx-auto">
        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Paste your video URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 p-3 sm:p-4 text-base sm:text-lg border-4 border-black rounded focus:outline-none focus:ring-4 focus:ring-[#FF8DC7]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#B6E388] px-6 sm:px-8 py-3 sm:py-4 border-4 border-black rounded font-bold text-base sm:text-lg
                       hover:bg-[#9ED572] transform transition-transform hover:-translate-y-0.5 sm:hover:-translate-y-1
                       active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                       flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              <span>{loading ? "Loading..." : "Get Info"}</span>
            </button>
          </div>
        </form>

        {/* Video Preview */}
        {preview && (
          <div className="bg-white p-6 sm:p-8 rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 sm:mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Thumbnail */}
              <div className="border-4 border-black rounded-lg overflow-hidden">
                <img
                  src={preview.thumbnail}
                  alt={preview.title}
                  className="w-full h-full sm:h-full object-cover"
                />
              </div>

              {/* Info */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-3">
                  {preview.title}
                </h3>
                <p className="text-gray-600 mb-2">{preview.author}</p>
                <p className="text-gray-600 mb-4">Durasi: {preview.duration}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                  {preview.description}
                </p>

                {url && matchLink(url) === "YouTube" && (
                  <div className="space-y-4">
                    {/* Video Download */}
                    <div
                      className="border-4 border-black rounded-lg p-4 bg-[#FFE5E5]"
                      onClick={() => setDownloadType("video")}
                    >
                      <button className="flex items-center gap-2 font-bold mb-2">
                        <Video size={16} />
                        <span>Download Video</span>
                      </button>
                      {downloadType === "video" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {resolutions.map((res) => (
                            <button
                              key={res.value}
                              onClick={() =>
                                handleDownload(res.label, "youtube-video")
                              }
                              disabled={downloading}
                              className="bg-white px-4 py-2 border-2 border-black rounded
                                     hover:bg-[#FF8DC7] transition-colors
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2"
                            >
                              {downloading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : null}
                              {res.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Audio Download */}
                    <div
                      className="border-4 border-black rounded-lg p-4 bg-[#B6E388]"
                      onClick={() => setDownloadType("audio")}
                    >
                      <button className="flex items-center gap-2 font-bold mb-2">
                        <Music size={16} />
                        <span>Download Audio</span>
                      </button>
                      {downloadType === "audio" && (
                        <button
                          onClick={() => handleDownload("", "youtube-audio")}
                          disabled={downloading}
                          className="w-full bg-white px-4 py-2 border-2 border-black rounded
                                 hover:bg-[#FF8DC7] transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center justify-center gap-2"
                        >
                          {downloading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : null}
                          Download MP3
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {matchLink(url) === "Facebook" && (
                  <div className="space-y-4">
                    {/* Video Download */}
                    <div
                      className="border-4 border-black rounded-lg p-4 bg-[#FFE5E5]"
                      onClick={() => setDownloadType("video")}
                    >
                      <button className="flex items-center gap-2 font-bold mb-2">
                        <Video size={16} />
                        <span>Download Video</span>
                      </button>
                      {downloadType === "video" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {preview.resolutions?.map((res) => (
                            <button
                              key={res.label}
                              onClick={() =>
                                handleDownload(res.label, "facebook-video")
                              }
                              disabled={downloading}
                              className="bg-white px-4 py-2 border-2 border-black rounded
                                     hover:bg-[#FF8DC7] transition-colors
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2"
                            >
                              {downloading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : null}
                              {res.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {preview && matchLink(url) === "Instagram" && (
                  <div className="bg-white p-6 sm:p-8 rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 sm:mb-12">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {preview.media?.map((media, index) => (
                        <div
                          key={index}
                          className="border-4 border-black rounded-lg overflow-hidden"
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt={`Media ${index}`}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="w-full h-48 object-cover"
                              controls
                            />
                          )}
                          <button
                            onClick={() =>
                              handleDownload(media.url, media.type)
                            }
                            className="w-full bg-[#B6E388] p-2 mt-2 rounded border-2 border-black"
                          >
                            Download {media.type}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {preview && matchLink(url) === "TikTok" && (
                  <div className="bg-white p-6 sm:p-8 rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 sm:mb-12">
                    {/* Download Options */}
                    <div className="space-y-4 mt-4">
                      {/* Video Download */}
                      <button
                        onClick={() => handleDownload(preview.videoUrl, "video")}
                        disabled={downloading}
                        className="w-full bg-[#FFE5E5] px-6 py-3 border-4 border-black rounded
                     hover:bg-[#FF8DC7] transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
                      >
                        {downloading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Video size={16} />
                        )}
                        Download Video
                      </button>

                      {/* Audio Download */}
                      <button
                        onClick={() => handleDownload(preview.audioUrl, "audio")}
                        disabled={downloading}
                        className="w-full bg-[#B6E388] px-6 py-3 border-4 border-black rounded
                     hover:bg-[#9ED572] transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
                      >
                        {downloading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Music size={16} />
                        )}
                        Download Audio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Supported Platforms */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 bg-[#FF8DC7] inline-block px-4 py-2 transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Supported Platforms
          </h2>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {[
              {
                name: "YouTube",
                icon: "bi-youtube", // Kode Bootstrap Icons
                color: "#FF0000",
              },
              {
                name: "Facebook",
                icon: "bi-facebook",
                color: "#1877F2",
              },
              {
                name: "Instagram",
                icon: "bi-instagram",
                color: "#E4405F",
              },
              {
                name: "TikTok",
                icon: "bi-tiktok", // Ikon TikTok dari Bootstrap
                color: "#2D52A4",
              },
            ].map((platform) => (
              <div
                key={platform.name}
                className={`${platform.color} p-4 sm:p-6 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                          transform transition-transform hover:scale-105`}
              >
                <i className={`${platform.icon} text-3xl mb-2 block`}></i>
                <p className="font-bold text-center">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 bg-[#B6E388] inline-block px-4 py-2 transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-[#FEFF86] p-3 rounded-full border-4 border-black font-bold">
                1
              </div>
              <ArrowRight className="flex-shrink-0" />
              <div className="bg-[#FFE5E5] p-4 rounded border-4 border-black flex-1">
                Copy the video URL from YouTube, Facebook, Instagram or TikTok
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-[#FEFF86] p-3 rounded-full border-4 border-black font-bold">
                2
              </div>
              <ArrowRight className="flex-shrink-0" />
              <div className="bg-[#FFE5E5] p-4 rounded border-4 border-black flex-1">
                Paste the URL in the input box above
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-[#FEFF86] p-3 rounded-full border-4 border-black font-bold">
                3
              </div>
              <ArrowRight className="flex-shrink-0" />
              <div className="bg-[#FFE5E5] p-4 rounded border-4 border-black flex-1">
                Choose your preferred format and quality, then download!
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-screen-md mx-auto text-center mt-8 sm:mt-16">
        <p className="bg-white inline-block px-4 py-2 transform rotate-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Made with ❤️ Piyo
        </p>
      </footer>
    </div>
  );
}

export default App;
