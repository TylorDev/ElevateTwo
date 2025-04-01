import { useEffect, useState } from "react";
import { ParseFile } from "./Utils/FileConverter";
import { AudioMetadata } from "./types/global";
import { dataToImageUrl } from "./Utils/ImageConverter";

function App() {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null);

  // Función para procesar los metadatos del archivo
  const processFileMetadata = (fileMetadata: AudioMetadata) => {
    setMetadata(fileMetadata);
    setAudioSrc(ParseFile(fileMetadata.base64));

    if (fileMetadata.cover) {
      setCoverSrc(dataToImageUrl(fileMetadata.cover));
    }
  };

  useEffect(() => {
    // Escuchar cuando un archivo es seleccionado desde argumentos o diálogo
    const handleFileSelected = async (__: unknown, filePath: string) => {
      const fileMetadata = await window.ipcRenderer.invoke(
        "process-file",
        filePath
      );
      if (fileMetadata) {
        processFileMetadata(fileMetadata);
      }
    };

    window.ipcRenderer.on("file-selected", handleFileSelected);

    return () => {
      // Remover listener al desmontar el componente
      window.ipcRenderer.offFileOpen();
    };
  }, []);

  const openFileDialog = async () => {
    const fileMetadata: AudioMetadata | null = await window.ipcRenderer.invoke(
      "dialog:openFile"
    );
    if (fileMetadata) {
      processFileMetadata(fileMetadata);
    }
  };

  return (
    <div>
      {coverSrc && <img src={coverSrc} width={200} alt="Carátula" />}
      <div>Cover Url: {coverSrc}</div>
      <div>Artista: {metadata?.artist ?? "Desconocido"}</div>
      <div>Nombre: {metadata?.name ?? "Desconocido"}</div>
      <button onClick={openFileDialog}>Abrir archivo</button>
      {audioSrc && <audio controls autoPlay loop src={audioSrc}></audio>}
    </div>
  );
}

export default App;
