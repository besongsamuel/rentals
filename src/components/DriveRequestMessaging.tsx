import { Send } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../contexts/UserContext";
import { assignmentRequestService } from "../services/assignmentRequestService";
import {
  AssignmentRequestMessageWithProfile,
  CarAssignmentRequest,
} from "../types";

interface DriveRequestMessagingProps {
  open: boolean;
  onClose: () => void;
  request: CarAssignmentRequest;
}

const DriveRequestMessaging: React.FC<DriveRequestMessagingProps> = ({
  open,
  onClose,
  request,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useUserContext();

  const [messages, setMessages] = useState<
    AssignmentRequestMessageWithProfile[]
  >([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [error, setError] = useState("");

  // Load messages when dialog opens
  useEffect(() => {
    if (open && request.id) {
      loadMessages();
    }
  }, [open, request.id]);

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      setError("");
      const { data, error: fetchError } =
        await assignmentRequestService.getRequestMessages(request.id);

      if (fetchError) {
        throw fetchError;
      }

      setMessages(data);
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError(err.message || t("driveRequests.messaging.loadError"));
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !profile?.id) return;

    try {
      setSendingMessage(true);
      setError("");

      const { error: sendError } = await assignmentRequestService.addMessage({
        request_id: request.id,
        user_id: profile.id,
        content: messageContent.trim(),
      });

      if (sendError) {
        throw sendError;
      }

      setMessageContent("");
      await loadMessages();
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || t("driveRequests.messaging.sendError"));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: { xs: "100%", sm: "80vh" },
          maxHeight: { xs: "100%", sm: "80vh" },
        },
      }}
    >
      <DialogTitle
        sx={{ pb: 1, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t("driveRequests.messaging.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {(request as any).cars?.make} {(request as any).cars?.model} -{" "}
          {(request as any).cars?.license_plate}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Messages List */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {loadingMessages ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {t("driveRequests.messaging.noMessages")}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                {t("driveRequests.messaging.startConversation")}
              </Typography>
            </Box>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.user_id === profile?.id;
              const senderName =
                message.profiles?.full_name || t("common.unknown");

              return (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                    gap: 1,
                  }}
                >
                  {!isCurrentUser && (
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        fontSize: "0.875rem",
                      }}
                    >
                      {getInitials(senderName)}
                    </Avatar>
                  )}

                  <Box
                    sx={{
                      maxWidth: "70%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isCurrentUser ? "flex-end" : "flex-start",
                    }}
                  >
                    {!isCurrentUser && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 0.5, px: 1 }}
                      >
                        {senderName}
                      </Typography>
                    )}

                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: isCurrentUser
                          ? theme.palette.primary.main
                          : theme.palette.background.default,
                        color: isCurrentUser
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                        borderRadius: 2,
                        wordBreak: "break-word",
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                    </Paper>

                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 0.5, px: 1 }}
                    >
                      {new Date(message.created_at).toLocaleString()}
                    </Typography>
                  </Box>

                  {isCurrentUser && (
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.secondary.main,
                        width: 32,
                        height: 32,
                        fontSize: "0.875rem",
                      }}
                    >
                      {getInitials(profile?.full_name || "")}
                    </Avatar>
                  )}
                </Box>
              );
            })
          )}
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={t("driveRequests.messaging.typePlaceholder")}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendingMessage}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || sendingMessage}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: "white",
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
                "&.Mui-disabled": {
                  bgcolor: theme.palette.action.disabledBackground,
                },
              }}
            >
              {sendingMessage ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Send />
              )}
            </IconButton>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriveRequestMessaging;
