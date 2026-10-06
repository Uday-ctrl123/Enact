import { Button } from "@/components/ui/button";

interface QuickQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export const QuickQuestions = ({ questions, onSelect }: QuickQuestionsProps) => {
  return (
    <div className="border-t p-4">
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Quick questions to get started:
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};
