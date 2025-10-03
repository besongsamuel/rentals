import { CloudUpload, Delete, InsertDriveFile } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";

interface FileUploadProps {
  bucket: string;
  path: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: string) => void;
  existingFileUrl?: string | null;
  label?: string;
  helperText?: string;
  isPublic?: boolean; // Whether the bucket is public (default: false)
}

const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  path,
  accept = "image/*",
  maxSizeMB = 5,
  onUploadComplete,
  onUploadError,
  existingFileUrl,
  label,
  helperText,
  isPublic = false,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null); // The actual storage path/URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Signed URL for preview

  // Generate signed URL for private buckets
  const generateSignedUrl = useCallback(
    async (filePath: string): Promise<string | null> => {
      if (isPublic) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
      }

      try {
        // Extract the path from the full URL if needed
        let cleanPath = filePath;
        if (filePath.includes(bucket)) {
          const urlParts = filePath.split("/");
          cleanPath = urlParts.slice(urlParts.indexOf(bucket) + 1).join("/");
        }

        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(cleanPath, 3600); // 1 hour expiration

        if (error) {
          console.error("Error creating signed URL:", error);
          return null;
        }

        return data.signedUrl;
      } catch (err) {
        console.error("Error generating signed URL:", err);
        return null;
      }
    },
    [bucket, isPublic]
  );

  // Sync with existingFileUrl prop changes
  useEffect(() => {
    const loadExistingFile = async () => {
      if (existingFileUrl) {
        setUploadedUrl(existingFileUrl);
        const signedUrl = await generateSignedUrl(existingFileUrl);
        setPreviewUrl(signedUrl);
      } else {
        setUploadedUrl(null);
        setPreviewUrl(null);
      }
    };

    loadExistingFile();
  }, [existingFileUrl, generateSignedUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(t("fileUpload.fileTooLarge", { maxSize: maxSizeMB.toString() }));
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Generate unique filename with timestamp
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get URL for storage (public or signed)
      let storageUrl: string;
      if (isPublic) {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        storageUrl = urlData.publicUrl;
      } else {
        // For private buckets, store the path
        storageUrl = data.path;
      }

      // Generate preview URL (signed URL for private buckets)
      const preview = await generateSignedUrl(data.path);

      setUploadedUrl(storageUrl);
      setPreviewUrl(preview);
      setSelectedFile(null);

      if (onUploadComplete) {
        onUploadComplete(storageUrl);
      }
    } catch (err: any) {
      const errorMessage = err.message || t("fileUpload.uploadError");
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadedUrl) return;

    try {
      // Extract file path from URL
      let filePath = uploadedUrl;
      if (uploadedUrl.includes(bucket)) {
        const urlParts = uploadedUrl.split("/");
        filePath = urlParts.slice(urlParts.indexOf(bucket) + 1).join("/");
      }

      // Delete file from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      setUploadedUrl(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      if (onUploadComplete) {
        onUploadComplete("");
      }
    } catch (err: any) {
      setError(err.message || t("fileUpload.deleteError"));
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {label}
        </Typography>
      )}

      {helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          {helperText}
        </Typography>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {uploadedUrl ? (
        <Box>
          {/* Image Preview */}
          {(accept?.includes("image") || !accept) && previewUrl && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  mb: 1,
                }}
              >
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Uploaded file"
                  sx={{
                    width: "100%",
                    maxWidth: 500,
                    height: "auto",
                    display: "block",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                    "&:hover": {
                      opacity: 0.9,
                    },
                  }}
                  onClick={() =>
                    previewUrl && window.open(previewUrl, "_blank")
                  }
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                {t("fileUpload.clickToView")}
              </Typography>
            </Box>
          )}

          {/* File Info and Delete */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <InsertDriveFile color="primary" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t("fileUpload.fileUploaded")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {uploadedUrl.split("/").pop()}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleDelete}
              color="error"
              size="small"
              disabled={uploading}
            >
              <Delete />
            </IconButton>
          </Paper>
        </Box>
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "2px dashed",
              borderColor: selectedFile ? "primary.main" : "divider",
              borderRadius: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(46, 125, 50, 0.02)",
              },
            }}
            onClick={handleButtonClick}
          >
            <CloudUpload
              sx={{
                fontSize: 48,
                color: selectedFile ? "primary.main" : "text.secondary",
                mb: 1,
              }}
            />
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              {selectedFile ? selectedFile.name : t("fileUpload.clickToUpload")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("fileUpload.maxSize", { size: maxSizeMB.toString() })}
            </Typography>
          </Paper>

          {selectedFile && (
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading}
                startIcon={
                  uploading ? <CircularProgress size={20} /> : <CloudUpload />
                }
                fullWidth
              >
                {uploading ? t("fileUpload.uploading") : t("fileUpload.upload")}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                {t("fileUpload.cancel")}
              </Button>
            </Box>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="indeterminate" />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default FileUpload;
