import { supabase } from "../lib/supabase";
import {
  Message,
  MessageWithProfile,
  MessageWithReplies,
  CreateMessageData,
} from "../types";

export const messageService = {
  // Get all messages for a weekly report with nested replies
  async getMessagesByWeeklyReport(
    weeklyReportId: string
  ): Promise<MessageWithReplies[]> {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          user_type
        )
      `)
      .eq("weekly_report_id", weeklyReportId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    // Organize messages into a tree structure
    const messages = data as MessageWithProfile[];
    return this.organizeMessagesIntoTree(messages);
  },

  // Create a new message
  async createMessage(messageData: CreateMessageData): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        weekly_report_id: messageData.weekly_report_id,
        content: messageData.content,
        parent_message_id: messageData.parent_message_id || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating message:", error);
      throw new Error(`Failed to create message: ${error.message}`);
    }

    // Fetch the complete message with profile data
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          user_type
        )
      `)
      .eq("id", data.id)
      .single();

    if (fetchError) {
      console.error("Error fetching created message:", fetchError);
      throw new Error(`Failed to fetch created message: ${fetchError.message}`);
    }

    return message as MessageWithProfile;
  },

  // Update a message
  async updateMessage(
    messageId: string,
    content: string
  ): Promise<MessageWithProfile> {
    const { data, error } = await supabase
      .from("messages")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", messageId)
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          user_type
        )
      `)
      .single();

    if (error) {
      console.error("Error updating message:", error);
      throw new Error(`Failed to update message: ${error.message}`);
    }

    return data as MessageWithProfile;
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    // First, delete all replies to this message
    const { error: deleteRepliesError } = await supabase
      .from("messages")
      .delete()
      .eq("parent_message_id", messageId);

    if (deleteRepliesError) {
      console.error("Error deleting message replies:", deleteRepliesError);
      throw new Error(`Failed to delete message replies: ${deleteRepliesError.message}`);
    }

    // Then delete the main message
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting message:", error);
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  },

  // Helper function to organize messages into a tree structure
  organizeMessagesIntoTree(messages: MessageWithProfile[]): MessageWithReplies[] {
    const messageMap = new Map<string, MessageWithReplies>();
    const rootMessages: MessageWithReplies[] = [];

    // First pass: create all message objects
    messages.forEach((message) => {
      messageMap.set(message.id, {
        ...message,
        replies: [],
      });
    });

    // Second pass: organize into tree structure
    messages.forEach((message) => {
      const messageWithReplies = messageMap.get(message.id)!;
      
      if (message.parent_message_id) {
        // This is a reply
        const parent = messageMap.get(message.parent_message_id);
        if (parent) {
          parent.replies.push(messageWithReplies);
        }
      } else {
        // This is a root message
        rootMessages.push(messageWithReplies);
      }
    });

    return rootMessages;
  },
};
