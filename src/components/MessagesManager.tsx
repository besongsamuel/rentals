import { Add, Close, Delete, Edit, MoreVert, Reply } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { messageService } from "../services/messageService";
import { CreateMessageData, MessageWithReplies, Profile } from "../types";

interface MessagesManagerProps {
  weeklyReportId: string;
  currentUser: Profile;
  open: boolean;
  onClose: () => void;
}

interface MessageItemProps {
  message: MessageWithReplies;
  currentUser: Profile;
  onReply: (parentMessageId: string) => void;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  level?: number;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  level = 0,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const isOwner = message.user_id === currentUser.id;
  const canEdit = isOwner;
  const canDelete = isOwner;

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
    setShowActions(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(message.id);
    setShowActions(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Box
      sx={{
        ml: level * 3,
        mb: 2,
        borderLeft: level > 0 ? "2px solid #e2e8f0" : "none",
        pl: level > 0 ? 2 : 0,
      }}
    >
      <Card
        sx={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 40,
                height: 40,
                fontSize: "0.875rem",
              }}
            >
              {getInitials(
                message.profiles?.full_name || null,
                message.profiles?.email || ""
              )}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  {message.profiles?.full_name || message.profiles?.email}
                </Typography>

                <Chip
                  label={message.profiles?.user_type}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.75rem",
                    backgroundColor:
                      message.profiles?.user_type === "owner"
                        ? "primary.main"
                        : "success.main",
                    color: "white",
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: "auto" }}
                >
                  {formatDate(message.created_at)}
                </Typography>

                {(canEdit || canDelete) && (
                  <IconButton
                    size="small"
                    onClick={() => setShowActions(!showActions)}
                    sx={{ ml: 1 }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              {showActions && (canEdit || canDelete) && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 40,
                    bgcolor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    zIndex: 1,
                  }}
                >
                  {canEdit && (
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={handleEdit}
                      sx={{
                        display: "block",
                        width: "100%",
                        justifyContent: "flex-start",
                      }}
                    >
                      {t("common.edit")}
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="small"
                      startIcon={<Delete />}
                      onClick={handleDelete}
                      sx={{
                        display: "block",
                        width: "100%",
                        justifyContent: "flex-start",
                        color: "error.main",
                      }}
                    >
                      {t("common.delete")}
                    </Button>
                  )}
                </Box>
              )}

              {isEditing ? (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSaveEdit}
                    >
                      {t("common.save")}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCancelEdit}
                    >
                      {t("common.cancel")}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {message.content}
                </Typography>
              )}

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  size="small"
                  startIcon={<Reply />}
                  onClick={() => onReply(message.id)}
                  sx={{ color: "primary.main" }}
                >
                  {t("common.reply")}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Render replies */}
      {message.replies.map((reply) => (
        <MessageItem
          key={reply.id}
          message={reply}
          currentUser={currentUser}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      ))}
    </Box>
  );
};

const MessagesManager: React.FC<MessagesManagerProps> = ({
  weeklyReportId,
  currentUser,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<MessageWithReplies[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const loadMessages = useCallback(async () => {
    if (!weeklyReportId) return;

    setLoading(true);
    try {
      const data = await messageService.getMessagesByWeeklyReport(
        weeklyReportId
      );
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [weeklyReportId]);

  useEffect(() => {
    if (open) {
      loadMessages();
    }
  }, [open, loadMessages]);

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData: CreateMessageData = {
        weekly_report_id: weeklyReportId,
        content: newMessage.trim(),
      };

      await messageService.createMessage(messageData);
      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !replyTo) return;

    try {
      const messageData: CreateMessageData = {
        weekly_report_id: weeklyReportId,
        content: replyContent.trim(),
        parent_message_id: replyTo,
      };

      await messageService.createMessage(messageData);
      setReplyContent("");
      setReplyTo(null);
      await loadMessages();
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await messageService.updateMessage(messageId, content);
      await loadMessages();
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
      await loadMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleReplyClick = (parentMessageId: string) => {
    setReplyTo(parentMessageId);
    setReplyContent("");
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyContent("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {t("messages.title")}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* New Message Form */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {t("messages.addComment")}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("messages.commentPlaceholder")}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddMessage}
            disabled={!newMessage.trim()}
          >
            {t("messages.addComment")}
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Messages List */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            {t("messages.comments")} ({messages.length})
          </Typography>

          {loading ? (
            <Typography color="text.secondary">
              {t("common.loading")}...
            </Typography>
          ) : messages.length === 0 ? (
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              {t("messages.noComments")}
            </Typography>
          ) : (
            <Box>
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                  onReply={handleReplyClick}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Reply Form */}
        {replyTo && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t("messages.replyToComment")}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t("messages.replyPlaceholder")}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={handleReply}
                disabled={!replyContent.trim()}
              >
                {t("messages.reply")}
              </Button>
              <Button variant="outlined" onClick={handleCancelReply}>
                {t("common.cancel")}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessagesManager;
