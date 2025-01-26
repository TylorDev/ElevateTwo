import { useEffect, useState } from "react";

function App() {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  useEffect(() => {
    // Escucha el evento "open-file" que envía el archivo base64
    window.ipcRenderer.on("open-file", (_, fileBase64: string) => {
      // Convertir el archivo base64 a un Blob
      const byteCharacters = atob(fileBase64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: "audio/mp3" }); // Ajusta el tipo según el archivo
      const audioUrl = URL.createObjectURL(blob);
      setAudioSrc(audioUrl);
    });

    return () => {
      window.ipcRenderer.off("open-file", () => {});
    };
  }, []);

  return (
    <div>
      {audioSrc && <audio controls autoPlay loop src={audioSrc}></audio>}
    </div>
  );
}

export default App;
