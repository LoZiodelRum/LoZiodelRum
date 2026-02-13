/**
 * Export compatibile con mobile: usa Web Share API quando disponibile,
 * altrimenti download classico. Su iOS il download spesso non funziona,
 * quindi la condivisione è preferibile.
 */
export async function exportAsFile(data, filename, { title = "Lo Zio del Rum", onSuccess, onError } = {}) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const safeFilename = filename || `export-${new Date().toISOString().slice(0, 10)}.json`;

  // Su mobile: prova Web Share API (condivisione nativa)
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const file = new File([blob], safeFilename, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: "Locali da approvare - Lo Zio del Rum",
        });
        onSuccess?.();
        return true;
      }
      // Fallback: condividi come testo (iOS Safari spesso non supporta file)
      const text = JSON.stringify(data, null, 2);
      if (text.length < 50000) {
        await navigator.share({ title: title, text: text });
        onSuccess?.();
        return true;
      }
    } catch (err) {
      if (err.name === "AbortError") return false; // utente ha annullato
      // Fallback su errore
    }
  }

  // Fallback: download (desktop o Share non disponibile)
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFilename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onSuccess?.();
    return true;
  } catch (err) {
    onError?.(err);
    return false;
  }
}
