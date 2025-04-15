import { Card, CardContent } from "@/components/ui/card";

interface BookCardProps {
  type?: "small" | "medium" | "large";
  className?: string;
}

const BookCard = ({ type = "medium", className = "" }: BookCardProps) => {
  // This is a placeholder component to represent book cards of different sizes
  // In a real app these would display actual book data and images
  
  const getHeightClasses = () => {
    switch (type) {
      case "small":
        return "h-24";
      case "large":
        return "h-64";
      case "medium":
      default:
        return "h-32";
    }
  };

  return (
    <Card className={`bg-[#F5F5F0] ${getHeightClasses()} flex items-center justify-center ${className}`}>
      <CardContent className="p-4 w-full h-full flex items-center justify-center">
        {/* Empty card representing where book content would go */}
      </CardContent>
    </Card>
  );
};

export default BookCard;
