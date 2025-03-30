import { useEffect, useState } from "react";
import { ParseFile } from "./Utils/FileConverter";

interface ImageData {
  data: Uint8Array;
  type: string;
}

const dataToImageUrl = (
  input: null | undefined | Uint8Array | ImageData,
  mimeType: string = "image/png"
): string => {
  const DEFAULT_IMAGE =
    "https://i.pinimg.com/736x/ef/23/25/ef2325cedb047b8ac24fc2b718c15a30.jpg";

  // Handle null or undefined input
  if (input == null) {
    return DEFAULT_IMAGE;
  }

  try {
    // Handle Uint8Array input
    if (input instanceof Uint8Array) {
      return URL.createObjectURL(new Blob([input], { type: mimeType }));
    }

    // Handle ImageData object input
    if ("data" in input && input.type !== "Other") {
      return URL.createObjectURL(new Blob([input.data], { type: mimeType }));
    }

    // Return default image if no conditions match
    return DEFAULT_IMAGE;
  } catch (error) {
    console.error("Error converting data to image URL:", error);
    return DEFAULT_IMAGE;
  }
};

function App() {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Omit<
    AudioMetadata,
    "base64" | "coverBase64"
  > | null>(null);

  useEffect(() => {
    const handleFileOpen = (_: unknown, fileMetadata: AudioMetadata) => {
      const audioUrl = ParseFile(fileMetadata.base64);
      setAudioSrc(audioUrl);
      setMetadata({ name: fileMetadata.name, artist: fileMetadata.artist });

      if (fileMetadata.coverBase64) {
        const coverUrl = dataToImageUrl(fileMetadata.coverBase64);
        setCoverSrc(coverUrl);
      }
    };

    window.ipcRenderer.on("open-file", handleFileOpen);

    return () => {
      window.ipcRenderer.off("open-file", handleFileOpen);
    };
  }, []);

  const openFileDialog = async () => {
    const fileMetadata: AudioMetadata | null = await window.ipcRenderer.invoke(
      "dialog:openFile"
    );
    if (fileMetadata) {
      const audioUrl = ParseFile(fileMetadata.base64);
      setAudioSrc(audioUrl);
      setMetadata({ name: fileMetadata.name, artist: fileMetadata.artist });

      if (fileMetadata.coverBase64) {
        const coverUrl = dataToImageUrl(fileMetadata.coverBase64);
        setCoverSrc(coverUrl);
      }
    }
  };

  return (
    <div>
      {coverSrc && <img src={coverSrc} alt="Carátula" />}
      <div>Artista: {metadata?.artist ?? "Desconocido"}</div>
      <div>Nombre: {metadata?.name ?? "Desconocido"}</div>
      <button onClick={openFileDialog}>Abrir archivo</button>
      {audioSrc && <audio controls autoPlay loop src={audioSrc}></audio>}
    </div>
  );
}

export default App;
