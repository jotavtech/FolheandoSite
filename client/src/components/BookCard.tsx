import { Card, CardContent } from "@/components/ui/card";

interface BookCardProps {
  type?: "small" | "medium" | "large";
  className?: string;
  imageUrl?: string;
  altText?: string;
}

const BookCard = ({ 
  type = "medium", 
  className = "", 
  imageUrl, 
  altText = "Capa do livro" 
}: BookCardProps) => {
  const getHeightClasses = () => {
    switch (type) {
      case "small":
        return "h-24";
      case "large":
        return "h-64";
      case "medium":
      default:
        return "h-40";
    }
  };

  const getWidthClasses = () => {
    switch (type) {
      case "small":
        return "w-16";
      case "large":
        return "w-48";
      case "medium":
      default:
        return "w-28";
    }
  };

  return (
    <Card className={`bg-[#F5F5F0] overflow-hidden ${getHeightClasses()} ${className}`}>
      <CardContent className="p-0 w-full h-full">
        {imageUrl ? (
          <div className="relative w-full h-full">
            <img
              src={imageUrl}
              alt={altText}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`${getHeightClasses()} ${getWidthClasses()} bg-gray-200 flex items-center justify-center mx-auto`}>
            <span className="text-gray-500 text-xs">Sem imagem</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookCard;