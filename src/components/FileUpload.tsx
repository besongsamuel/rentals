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

interface UploadedFile {
  storageUrl: string; // The actual storage path/URL
  previewUrl: string | null; // Signed URL for preview
}

interface FileUploadProps {
  bucket: string;
  path: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete?: (url: string | string[]) => void;
  onFileDeleted?: (url: string | string[]) => void;
  onUploadError?: (error: string) => void;
  existingFileUrl?: string | string[] | null;
  label?: string;
  helperText?: string;
  isPublic?: boolean; // Whether the bucket is public (default: false)
  multiple?: boolean; // Allow multiple file uploads
  maxFiles?: number; // Maximum number of files (only applies if multiple is true)
}

const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  path,
  accept = "image/*",
  maxSizeMB = 5,
  onUploadComplete,
  onFileDeleted,
  onUploadError,
  existingFileUrl,
  label,
  helperText,
  isPublic = false,
  multiple = false,
  maxFiles = 10,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Helper function to extract clean file path from URL
  const extractCleanFilePath = useCallback(
    (url: string): string => {
      let cleanPath = url;

      // Remove query parameters first
      if (cleanPath.includes("?")) {
        cleanPath = cleanPath.split("?")[0];
      }

      // Extract path from full URL if it contains bucket name
      if (cleanPath.includes(bucket)) {
        const urlParts = cleanPath.split("/");
        cleanPath = urlParts.slice(urlParts.indexOf(bucket) + 1).join("/");
      }

      return cleanPath;
    },
    [bucket]
  );

  // Generate signed URL for private buckets
  const generateSignedUrl = useCallback(
    async (filePath: string): Promise<string | null> => {
      // If it's already a full URL (starts with http), return it as-is
      if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        return filePath;
      }

      if (isPublic) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
      }

      try {
        // Extract the clean file path from URL
        const cleanPath = extractCleanFilePath(filePath);

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
    [bucket, isPublic, extractCleanFilePath]
  );

  // Sync with existingFileUrl prop changes
  useEffect(() => {
    const loadExistingFiles = async () => {
      if (!existingFileUrl) {
        setUploadedFiles([]);
        return;
      }

      const urls = Array.isArray(existingFileUrl)
        ? existingFileUrl
        : [existingFileUrl];
      const filesWithPreviews = await Promise.all(
        urls.map(async (url) => {
          const previewUrl = await generateSignedUrl(url);
          return {
            storageUrl: url,
            previewUrl,
          };
        })
      );

      setUploadedFiles(filesWithPreviews);
    };

    loadExistingFiles();
  }, [existingFileUrl, generateSignedUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    // Check if adding these files would exceed maxFiles
    if (multiple && uploadedFiles.length + filesArray.length > maxFiles) {
      setError(t("fileUpload.maxFilesExceeded", { maxFiles: maxFiles }));
      return;
    }

    // Validate each file size
    for (const file of filesArray) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(
          t("fileUpload.fileTooLarge", { maxSize: maxSizeMB.toString() })
        );
        return;
      }
    }

    setSelectedFiles(multiple ? filesArray : [filesArray[0]]);
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      const newUploadedFiles: UploadedFile[] = [];

      // Upload files sequentially
      for (const file of selectedFiles) {
        // Generate unique filename with timestamp
        const fileExt = file.name.split(".").pop();
        const fileName = `${path}/${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;

        // Upload file to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
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

        uploadedUrls.push(storageUrl);
        newUploadedFiles.push({ storageUrl, previewUrl: preview });
      }

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
      setSelectedFiles([]);

      if (onUploadComplete) {
        if (multiple) {
          onUploadComplete(uploadedUrls);
        } else {
          onUploadComplete(uploadedUrls[0]);
        }
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

  const handleDelete = async (fileToDelete: UploadedFile) => {
    try {
      // Extract clean file path from URL
      const filePath = extractCleanFilePath(fileToDelete.storageUrl);

      // Delete file from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Remove from uploaded files
      setUploadedFiles((prev) =>
        prev.filter((f) => f.storageUrl !== fileToDelete.storageUrl)
      );

      // Notify parent component about file deletion
      if (onFileDeleted) {
        const remainingUrls = uploadedFiles
          .filter((f) => f.storageUrl !== fileToDelete.storageUrl)
          .map((f) => f.storageUrl);

        if (multiple) {
          onFileDeleted(remainingUrls);
        } else {
          onFileDeleted("");
        }
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
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: multiple
                ? { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }
                : "1fr",
              gap: 2,
              mb: 2,
            }}
          >
            {uploadedFiles.map((file, index) => (
              <Box key={index}>
                {/* Image Preview */}
                {(accept?.includes("image") || !accept) && file.previewUrl && (
                  <Box sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                      }}
                    >
                      <Box
                        component="img"
                        src={file.previewUrl}
                        alt={`Uploaded file ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: { xs: 250, sm: 300, md: 350 },
                          objectFit: "contain",
                          display: "block",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                          "&:hover": {
                            opacity: 0.9,
                          },
                        }}
                        onClick={() =>
                          file.previewUrl &&
                          window.open(file.previewUrl, "_blank")
                        }
                      />
                      <IconButton
                        onClick={() => handleDelete(file)}
                        disabled={uploading}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(255, 255, 255, 0.9)",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 1)",
                          },
                        }}
                        size="small"
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Box>
                  </Box>
                )}

                {/* File Info (non-image files or no preview) */}
                {(!accept?.includes("image") || !file.previewUrl) && (
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
                          {file.storageUrl.split("/").pop()}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={() => handleDelete(file)}
                      color="error"
                      size="small"
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  </Paper>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Upload area - only show if not at max files or not multiple */}
      {(!multiple || uploadedFiles.length < maxFiles) && (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "2px dashed",
              borderColor:
                selectedFiles.length > 0 ? "primary.main" : "divider",
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
                color:
                  selectedFiles.length > 0 ? "primary.main" : "text.secondary",
                mb: 1,
              }}
            />
            <Typography variant="body1" sx={{ mb: 0.5 }}>
              {selectedFiles.length > 0
                ? multiple
                  ? t("fileUpload.filesSelected", {
                      count: selectedFiles.length,
                    })
                  : selectedFiles[0].name
                : t("fileUpload.clickToUpload")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("fileUpload.maxSize", { size: maxSizeMB.toString() })}
              {multiple &&
                ` • ${t("fileUpload.maxFilesLimit", {
                  max: maxFiles.toString(),
                })}`}
            </Typography>
          </Paper>

          {selectedFiles.length > 0 && (
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
                onClick={() => setSelectedFiles([])}
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
