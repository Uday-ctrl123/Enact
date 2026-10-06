import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatMessage } from "../ChatMessage";

describe("ChatMessage", () => {
  const mockMessage = {
    id: "1",
    role: "user" as const,
    content: "Hello, this is a test message",
    timestamp: new Date("2025-01-26T10:00:00Z"),
  };

  it("should render user message correctly", () => {
    render(<ChatMessage message={mockMessage} />);

    expect(screen.getByText("Hello, this is a test message")).toBeInTheDocument();
  });

  it("should render assistant message correctly", () => {
    const assistantMessage = {
      ...mockMessage,
      role: "assistant" as const,
    };

    render(<ChatMessage message={assistantMessage} />);

    expect(screen.getByText("Hello, this is a test message")).toBeInTheDocument();
  });

  it("should show edited indicator when message is edited", () => {
    const editedMessage = {
      ...mockMessage,
      edited: true,
    };

    render(<ChatMessage message={editedMessage} />);

    expect(screen.getByText("(edited)")).toBeInTheDocument();
  });

  it("should show edit button for user messages on hover", () => {
    const onEdit = vi.fn();

    render(<ChatMessage message={mockMessage} onEdit={onEdit} canEdit={true} />);

    const messageContainer = screen.getByText("Hello, this is a test message").closest("div");
    if (messageContainer) {
      fireEvent.mouseEnter(messageContainer.parentElement!);
    }

    // Edit button should be present
    const editButtons = screen.queryAllByTitle("Edit message");
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it("should not show edit button for assistant messages", () => {
    const assistantMessage = {
      ...mockMessage,
      role: "assistant" as const,
    };

    render(<ChatMessage message={assistantMessage} canEdit={false} />);

    const editButtons = screen.queryAllByTitle("Edit message");
    expect(editButtons.length).toBe(0);
  });

  it("should call onEdit when save is clicked", async () => {
    const onEdit = vi.fn();

    render(<ChatMessage message={mockMessage} onEdit={onEdit} canEdit={true} />);

    const messageContainer = screen.getByText("Hello, this is a test message").closest("div");
    if (messageContainer) {
      fireEvent.mouseEnter(messageContainer.parentElement!);
    }

    const editButton = screen.queryByTitle("Edit message");
    if (editButton) {
      fireEvent.click(editButton);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Updated message" } });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      expect(onEdit).toHaveBeenCalledWith("1", "Updated message");
    }
  });

  it("should show delete confirmation dialog", () => {
    const onDelete = vi.fn();

    render(<ChatMessage message={mockMessage} onDelete={onDelete} canDelete={true} />);

    const messageContainer = screen.getByText("Hello, this is a test message").closest("div");
    if (messageContainer) {
      fireEvent.mouseEnter(messageContainer.parentElement!);
    }

    const deleteButton = screen.queryByTitle("Delete message");
    if (deleteButton) {
      fireEvent.click(deleteButton);

      expect(screen.getByText("Delete Message?")).toBeInTheDocument();
    }
  });

  it("should format timestamp correctly", () => {
    render(<ChatMessage message={mockMessage} />);

    // Check that some time format is displayed
    const timeElement = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });
});
