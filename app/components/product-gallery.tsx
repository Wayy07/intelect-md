'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";

// Updated to match the exact structure from the API
interface ProductImage {
  UUID?: string;
  pathGlobal: string;
  name?: string;
  path?: string;
  data?: any;
  deletionMark?: boolean;
}

interface ProcessedImage extends ProductImage {
  UUID: string;
  name: string;
}

interface ProductGalleryProps {
  images: string[] | ProductImage[] | any[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Track if we're on mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // References for drag behavior
  const dragX = useMotionValue(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Setup carousel event handlers
  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setActiveImage(carouselApi.selectedScrollSnap());

      // Sync thumbnails with main carousel
      if (thumbnailApi) {
        thumbnailApi.scrollTo(carouselApi.selectedScrollSnap());
      }
    });

    // Sync the carousel with activeImage state
    carouselApi.scrollTo(activeImage);
  }, [carouselApi, activeImage, thumbnailApi]);

  // Process images on component load
  useEffect(() => {
    console.log('ProductGallery received images:', images);

    if (!images || images.length === 0) return;

    try {
      // Process all images
      const processedImages = (images as any[]).map((img, index) => {
        const uuid = img.UUID || `img-${index}-${Math.random().toString(36).substring(2, 9)}`;

        if (typeof img === 'string') {
          return {
            UUID: uuid,
            pathGlobal: img,
            name: `Image ${index + 1}`
          };
        }

        return {
          ...img,
          UUID: uuid,
          name: img.name || `Image ${index + 1}`
        };
      });

      setProcessedImages(processedImages);
      console.log('Processed images:', processedImages);
    }
    catch (err) {
      console.error('Error processing images:', err);
      // Fallback to a simple approach
      const simplifiedImages = (images as any[]).map((img, index) => {
        const uuid = `img-${index}-${Math.random().toString(36).substring(2, 9)}`;
        const url = typeof img === 'string' ? img : img.pathGlobal || '';

        return {
          UUID: uuid,
          pathGlobal: url,
          name: `Image ${index + 1}`
        };
      });

      setProcessedImages(simplifiedImages);
    }
  }, [images]);

  // Handle image load error by removing the broken image
  const handleImageError = (uuid: string) => {
    console.warn(`Image ${uuid} failed to load, removing it from gallery`);

    // Add to failed images set
    setFailedImages(prev => {
      const updated = new Set(prev);
      updated.add(uuid);
      return updated;
    });

    // If the current active image failed, move to the next valid one
    if (filteredImages.length > 0 && activeImage >= filteredImages.length - 1) {
      setActiveImage(Math.max(0, filteredImages.length - 1));
    }
  };

  // Filter out failed images
  const filteredImages = processedImages.filter(img => !failedImages.has(img.UUID));

  // Handle empty images array or all images failed
  if (!filteredImages || filteredImages.length === 0) {
    return (
      <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  const toggleZoom = () => {
    setImageZoomed(!imageZoomed);
  };

  const nextImage = () => {
    if (carouselApi) {
      carouselApi.scrollNext();
    } else {
      setActiveImage((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (carouselApi) {
      carouselApi.scrollPrev();
    } else {
      setActiveImage((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
    }
  };

  // Handle drag end for swipe gestures
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // Minimum drag distance to trigger navigation

    if (info.offset.x > threshold) {
      prevImage();
    } else if (info.offset.x < -threshold) {
      nextImage();
    }

    setIsDragging(false);
  };

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (imageZoomed) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || imageZoomed) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    setDragDistance(diff);
  };

  const handleTouchEnd = () => {
    if (imageZoomed) return;

    const threshold = 50;

    if (dragDistance > threshold) {
      nextImage();
    } else if (dragDistance < -threshold) {
      prevImage();
    }

    setIsDragging(false);
    setDragDistance(0);
  };

  // Add cache busting when rendering the image
  const getImageSrcWithCacheBusting = (url: string, uuid: string) => {
    if (!url) return '';
    // Use UUID for cache busting but avoid timestamps that cause constant rerendering
    return `${url}${url.includes('?') ? '&' : '?'}_cache=${uuid}`;
  };

  return (
    <div className="space-y-4 max-w-[600px] mx-auto lg:mx-0" ref={galleryRef}>
      {/* Main image carousel */}
      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "center",
          loop: true,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {filteredImages.map((image, index) => (
            <CarouselItem key={`carousel-${image.UUID}`} className="relative">
              <motion.div
                className={cn(
                  "aspect-[4/3] md:aspect-square w-full bg-white rounded-lg overflow-hidden border relative",
                  imageZoomed ? "cursor-zoom-out" : "cursor-grab active:cursor-grabbing"
                )}
                onClick={toggleZoom}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                drag={!imageZoomed ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                whileTap={{ cursor: "grabbing" }}
                onDragEnd={handleDragEnd}
              >
                <motion.div
                  className={cn(
                    "w-full h-full relative transition-transform duration-300",
                    imageZoomed && "scale-150"
                  )}
                  animate={{ scale: imageZoomed ? 1.5 : 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                >
                  <Image
                    src={getImageSrcWithCacheBusting(image.pathGlobal, image.UUID)}
                    alt={image.name || `${productName} - Image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className="object-contain p-4"
                    priority={index === activeImage}
                    unoptimized={true}
                    key={`main-img-${image.UUID}`}
                    draggable={false}
                    onError={() => handleImageError(image.UUID)}
                  />
                </motion.div>

                {/* Zoom button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoom();
                  }}
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 h-8 w-8"
                  aria-label={imageZoomed ? "Zoom out" : "Zoom in"}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation controls */}
        {filteredImages.length > 1 && !imageZoomed && (
          <>
            <CarouselPrevious
              className="h-8 w-8 sm:h-9 sm:w-9 -left-3 sm:left-1 shadow-md bg-white/90 hover:bg-white border-0"
            />
            <CarouselNext
              className="h-8 w-8 sm:h-9 sm:w-9 -right-3 sm:right-1 shadow-md bg-white/90 hover:bg-white border-0"
            />
          </>
        )}
      </Carousel>

      {/* Thumbnails row - only show if there are multiple images */}
      {filteredImages.length > 1 && (
        <div className="mt-4">
          <Carousel
            setApi={setThumbnailApi}
            opts={{
              align: "start",
              dragFree: true,
              containScroll: "trimSnaps",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {filteredImages.map((image, index) => (
                <CarouselItem
                  key={`thumb-${image.UUID}`}
                  className="pl-2 md:pl-4 basis-1/5 sm:basis-1/6 md:basis-1/7 lg:basis-1/8"
                >
                  <Button
                    onClick={() => {
                      setActiveImage(index);
                      if (carouselApi) carouselApi.scrollTo(index);
                    }}
                    variant="ghost"
                    className={cn(
                      "p-0 h-auto w-full relative rounded-lg overflow-hidden border transition-all duration-200",
                      activeImage === index
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary"
                    )}
                  >
                    <div className="aspect-square w-full relative">
                      <Image
                        src={getImageSrcWithCacheBusting(image.pathGlobal, `thumb-${image.UUID}`)}
                        alt={image.name || `${productName} - Image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 80px, 100px"
                        className="object-contain p-1"
                        unoptimized={true}
                        draggable={false}
                        key={`thumb-img-${image.UUID}`}
                        onError={() => handleImageError(image.UUID)}
                      />
                    </div>
                  </Button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </div>
  );
}
