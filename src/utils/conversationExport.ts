import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ConversationExportData {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

/**
 * Export conversation as JSON
 */
export async function exportConversationAsJSON(conversationId: string): Promise<void> {
  try {
    // Fetch conversation with all messages
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        title,
        created_at,
        updated_at,
        messages (
          id,
          role,
          content,
          created_at
        )
      `
      )
      .eq("id", conversationId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Conversation not found");

    const exportData: ConversationExportData = {
      id: data.id,
      title: data.title,
      created_at: data.created_at,
      updated_at: data.updated_at,
      messages: (data.messages as Message[]) || [],
    };

    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation-${data.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting conversation:", error);
    throw error;
  }
}

/**
 * Export conversation as plain text
 */
export async function exportConversationAsText(conversationId: string): Promise<void> {
  try {
    // Fetch conversation with all messages
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        title,
        created_at,
        updated_at,
        messages (
          id,
          role,
          content,
          created_at
        )
      `
      )
      .eq("id", conversationId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Conversation not found");

    // Format as text
    let textContent = `TYSON LEGAL ASSISTANT - CONVERSATION EXPORT\n`;
    textContent += `${"=".repeat(60)}\n\n`;
    textContent += `Title: ${data.title}\n`;
    textContent += `Created: ${format(new Date(data.created_at), "PPpp")}\n`;
    textContent += `Updated: ${format(new Date(data.updated_at), "PPpp")}\n`;
    textContent += `\n${"=".repeat(60)}\n\n`;

    const messages = (data.messages as Message[]) || [];
    messages.forEach((msg, index) => {
      const timestamp = format(new Date(msg.created_at), "PPpp");
      const role = msg.role === "user" ? "USER" : "ASSISTANT";
      textContent += `[${index + 1}] ${role} - ${timestamp}\n`;
      textContent += `${"-".repeat(60)}\n`;
      textContent += `${msg.content}\n\n`;
    });

    textContent += `${"=".repeat(60)}\n`;
    textContent += `End of conversation\n`;

    // Create blob and download
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation-${data.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting conversation:", error);
    throw error;
  }
}

/**
 * Export conversation as Markdown
 */
export async function exportConversationAsMarkdown(conversationId: string): Promise<void> {
  try {
    // Fetch conversation with all messages
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        title,
        created_at,
        updated_at,
        messages (
          id,
          role,
          content,
          created_at
        )
      `
      )
      .eq("id", conversationId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Conversation not found");

    // Format as markdown
    let mdContent = `# ${data.title}\n\n`;
    mdContent += `**Created:** ${format(new Date(data.created_at), "PPpp")}  \n`;
    mdContent += `**Updated:** ${format(new Date(data.updated_at), "PPpp")}  \n\n`;
    mdContent += `---\n\n`;

    const messages = (data.messages as Message[]) || [];
    messages.forEach((msg) => {
      const timestamp = format(new Date(msg.created_at), "PPpp");
      const role = msg.role === "user" ? "👤 User" : "🤖 Assistant";
      mdContent += `## ${role}\n`;
      mdContent += `*${timestamp}*\n\n`;
      mdContent += `${msg.content}\n\n`;
      mdContent += `---\n\n`;
    });

    mdContent += `*Exported from TYSON Legal Assistant*\n`;

    // Create blob and download
    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation-${data.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting conversation:", error);
    throw error;
  }
}
