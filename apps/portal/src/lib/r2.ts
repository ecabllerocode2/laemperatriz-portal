export async function uploadToR2(presignedUrl: string, file: File): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Error al subir imagen: ${response.status}`);
  }
}
