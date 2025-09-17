import { Box, Button, Stack } from "@mui/material";
import MDEditor from "@uiw/react-md-editor";
import React from "react";
import { useTranslation } from "react-i18next";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  showPreview?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your message here...",
  minHeight = 120,
  maxHeight = 300,
  showPreview = true,
  onSave,
  onCancel,
  showActions = false,
  readOnly = false,
}) => {
  const { t } = useTranslation();

  if (readOnly) {
    return (
      <Box
        sx={{
          "& .w-md-editor": {
            backgroundColor: "transparent",
            border: "none",
            boxShadow: "none",
          },
          "& .w-md-editor-text": {
            backgroundColor: "transparent",
            color: "text.primary",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          },
          "& .w-md-editor-text-container": {
            padding: 0,
          },
          "& .w-md-editor-text-input": {
            padding: 0,
            minHeight: "auto",
          },
          "& .w-md-editor-preview": {
            padding: 0,
            backgroundColor: "transparent",
          },
          "& .w-md-editor-preview .wmde-markdown": {
            backgroundColor: "transparent",
            color: "text.primary",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          },
          "& .w-md-editor-preview .wmde-markdown h1, .w-md-editor-preview .wmde-markdown h2, .w-md-editor-preview .wmde-markdown h3":
            {
              color: "text.primary",
              marginTop: "1rem",
              marginBottom: "0.5rem",
            },
          "& .w-md-editor-preview .wmde-markdown p": {
            marginBottom: "0.5rem",
          },
          "& .w-md-editor-preview .wmde-markdown ul, .w-md-editor-preview .wmde-markdown ol":
            {
              marginBottom: "0.5rem",
            },
          "& .w-md-editor-preview .wmde-markdown blockquote": {
            borderLeft: "3px solid #e2e8f0",
            paddingLeft: "1rem",
            margin: "0.5rem 0",
            color: "text.secondary",
            fontStyle: "italic",
          },
          "& .w-md-editor-preview .wmde-markdown code": {
            backgroundColor: "#f1f5f9",
            padding: "0.125rem 0.25rem",
            borderRadius: "0.25rem",
            fontSize: "0.8rem",
            color: "#e11d48",
          },
          "& .w-md-editor-preview .wmde-markdown pre": {
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            padding: "1rem",
            overflow: "auto",
          },
          "& .w-md-editor-preview .wmde-markdown pre code": {
            backgroundColor: "transparent",
            padding: 0,
            color: "text.primary",
          },
        }}
      >
        <MDEditor.Markdown
          source={value}
          style={{
            backgroundColor: "transparent",
            color: "text.primary",
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          "& .w-md-editor": {
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
          },
          "& .w-md-editor-toolbar": {
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            borderRadius: "0.5rem 0.5rem 0 0",
          },
          "& .w-md-editor-toolbar button": {
            color: "#64748b",
            "&:hover": {
              backgroundColor: "#e2e8f0",
              color: "#0f172a",
            },
            "&.active": {
              backgroundColor: "#2563eb",
              color: "#ffffff",
            },
          },
          "& .w-md-editor-text": {
            backgroundColor: "#ffffff",
            color: "#0f172a",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          },
          "& .w-md-editor-text-input": {
            padding: "1rem",
            minHeight: `${minHeight - 40}px`,
            "&::placeholder": {
              color: "#94a3b8",
            },
          },
          "& .w-md-editor-preview": {
            backgroundColor: "#ffffff",
            padding: "1rem",
            borderLeft: "1px solid #e2e8f0",
          },
          "& .w-md-editor-preview .wmde-markdown": {
            backgroundColor: "transparent",
            color: "#0f172a",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          },
          "& .w-md-editor-preview .wmde-markdown h1, .w-md-editor-preview .wmde-markdown h2, .w-md-editor-preview .wmde-markdown h3":
            {
              color: "#0f172a",
              marginTop: "1rem",
              marginBottom: "0.5rem",
            },
          "& .w-md-editor-preview .wmde-markdown p": {
            marginBottom: "0.5rem",
          },
          "& .w-md-editor-preview .wmde-markdown ul, .w-md-editor-preview .wmde-markdown ol":
            {
              marginBottom: "0.5rem",
            },
          "& .w-md-editor-preview .wmde-markdown blockquote": {
            borderLeft: "3px solid #e2e8f0",
            paddingLeft: "1rem",
            margin: "0.5rem 0",
            color: "#64748b",
            fontStyle: "italic",
          },
          "& .w-md-editor-preview .wmde-markdown code": {
            backgroundColor: "#f1f5f9",
            padding: "0.125rem 0.25rem",
            borderRadius: "0.25rem",
            fontSize: "0.8rem",
            color: "#e11d48",
          },
          "& .w-md-editor-preview .wmde-markdown pre": {
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            padding: "1rem",
            overflow: "auto",
          },
          "& .w-md-editor-preview .wmde-markdown pre code": {
            backgroundColor: "transparent",
            padding: 0,
            color: "#0f172a",
          },
          "& .w-md-editor-preview .wmde-markdown a": {
            color: "#2563eb",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          },
          "& .w-md-editor-preview .wmde-markdown table": {
            borderCollapse: "collapse",
            width: "100%",
            marginBottom: "1rem",
          },
          "& .w-md-editor-preview .wmde-markdown th, .w-md-editor-preview .wmde-markdown td":
            {
              border: "1px solid #e2e8f0",
              padding: "0.5rem",
              textAlign: "left",
            },
          "& .w-md-editor-preview .wmde-markdown th": {
            backgroundColor: "#f8fafc",
            fontWeight: 600,
          },
        }}
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          data-color-mode="light"
          preview={showPreview ? "edit" : "live"}
          hideToolbar={false}
          visibleDragbar={false}
          height={minHeight}
          textareaProps={{
            placeholder: placeholder,
            style: {
              fontSize: "0.875rem",
              lineHeight: 1.6,
            },
          }}
        />
      </Box>

      {showActions && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {onSave && (
            <Button
              variant="contained"
              onClick={onSave}
              disabled={!value.trim()}
            >
              {t("common.save")}
            </Button>
          )}
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default RichTextEditor;
