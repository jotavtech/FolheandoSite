import { useRef, ReactNode } from "react";
import { Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SliderProps {
  title: string;
  children: ReactNode;
  className?: string;
  showControls?: boolean;
}

const Slider = ({ title, children, className = "", showControls = true }: SliderProps) => {
  const carouselRef = useRef(null);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">{title}</h2>
        {showControls && (
          <div className="flex items-center">
            <div className="w-32 bg-gray-700 h-1 rounded-full mr-2">
              <div className="bg-white w-1/3 h-full rounded-full"></div>
            </div>
            <button className="ml-2">
              <Play className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <Carousel ref={carouselRef} className="w-full">
        <CarouselContent>
          {children}
        </CarouselContent>
        {showControls && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default Slider;
