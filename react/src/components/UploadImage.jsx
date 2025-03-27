import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';

const UploadImage = () => {
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState(""); // Stores the image URL
  const [error, setError] = useState("");
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]; // Get the first file
    if (!file) {
      setError("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setError(""); // Reset error

    if (allowedTypes.includes(file.type)) {
      setFileName(file.name);
      setFileUrl(URL.createObjectURL(file)); // Create a temporary URL to display the image

      try {
        const response = await fetch("http://localhost:3001/upload", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          console.log("Image uploaded successfully!");
        } else {
          console.error("Error uploading the image.");
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    } else {
      setFileName("");
      setFileUrl("");
      setError(`Only images (JPG, PNG, WEBP, SVG) are allowed!`);
      return;
    }

  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  if (error) {
    return <ThrowAdminError error={error} setError={setError} />;
  }

  return (
    <div {...getRootProps()} style={{ border: "2px dashed #ccc", padding: "20px", cursor: "pointer", alignItems: 'center', display: 'flex', flexDirection: 'column', borderRadius: '1000px' }}>
      <input {...getInputProps()} />
      {fileUrl ? (
        <img src={fileUrl} alt="Preview" className="mt-2 w-32 h-auto object-cover connection" width="250px" height="250px" />
      ) : (
        <img src="/src/assets/images/IcoOutline.svg" alt="Placeholder" className="mt-2 w-32 h-auto object-cover connection" width="250px" height="250px" />
      )}
      <p>Drag and drop an image here, <br /> or click to select a file</p>
      {error && <p style={{ color: "black", width: '250px'}}>{error}</p>}
    </div>
  );
};

export default UploadImage;