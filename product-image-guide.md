# Product Image Gallery Implementation Guide

## Overview
The product API now provides an `imageList` property with multiple unique product images. This guide explains how to implement a proper image gallery using this data.

## API Response Structure
Each product contains an `imageList` object with an `image` array:

```javascript
{
  "product": {
    // other product fields...
    "imageList": {
      "image": [
        {
          "UUID": "02259b86-27a3-48ad-8116-cb797d84336d",
          "name": "145522_4.png",
          "pathGlobal": "https://cdn-ultra.esempla.com/storage/02259b86-27a3-48ad-8116-cb797d84336d.png",
          "deletionMark": false
        },
        // more images...
      ]
    }
  }
}
```

## Recent Fix: Unique Image URLs

We've recently fixed an issue where all images had the same URL despite having different UUIDs. The backend now:

1. Uses each image's unique UUID to generate a distinct CDN URL
2. Ensures `pathGlobal` contains the correct unique URL for each image
3. Falls back to constructing a URL from the UUID if no cached image data is found

If you're still seeing identical images, please:

1. Clear your browser cache
2. Verify you're using the latest API version
3. Check the Network tab to ensure different image URLs are being requested

## Implementation Guide

### 1. React Component for Product Gallery

```jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function ProductGallery({ product }) {
  const [activeImage, setActiveImage] = useState(0);

  // Extract images from the product
  const images = product?.imageList?.image || [];

  // Debug: Log image URLs to console
  useEffect(() => {
    if (images.length > 0) {
      console.log('Product has', images.length, 'images');
      images.forEach((img, i) => {
        console.log(`Image ${i+1} URL:`, img.pathGlobal);
      });
    }
  }, [images]);

  // If no images are available, show a placeholder
  if (!images.length) {
    return (
      <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Main large image */}
      <div className="aspect-square w-full bg-white rounded-lg overflow-hidden border">
        <Image
          src={images[activeImage].pathGlobal}
          alt={images[activeImage].name || 'Product image'}
          width={600}
          height={600}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Thumbnails row - only show if there are multiple images */}
      {images.length > 1 && (
        <div className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.UUID}
              onClick={() => setActiveImage(index)}
              className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                activeImage === index ? 'border-blue-600' : 'border-gray-200'
              }`}
            >
              <Image
                src={image.pathGlobal}
                alt={image.name || `Product image ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Usage in Product Page

```jsx
import { ProductGallery } from '@/components/product-gallery';

export default function ProductPage({ product }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Product gallery in left column */}
      <div>
        <ProductGallery product={product} />
      </div>

      {/* Product details in right column */}
      <div>
        <h1 className="text-2xl font-bold">{product.nume}</h1>
        <p className="text-xl font-semibold mt-2">
          {product.pret} {product.currency}
        </p>
        {/* Other product details */}
      </div>
    </div>
  );
}
```

### 3. Important Notes

1. **Always use `pathGlobal` for image URLs** - This contains the CDN URL for the image
2. **Use `UUID` as the key** when mapping through images
3. **Provide fallbacks** for missing images
4. **Check that `imageList` and `image` array exist** before accessing

### 4. Common Problems

If all images appear the same:

1. Verify you're using the individual `pathGlobal` URL from each image object
2. Ensure you're mapping through the `imageList.image` array
3. Check your network tab to confirm different image URLs are being requested
4. Try clearing your browser cache

### 5. Advanced Debugging

If images still appear identical despite having different URLs, try this approach:

```jsx
// Alternate method that forces unique image URLs using the UUID
function getUniqueImageUrl(image, index) {
  // Use the UUID to construct a guaranteed unique URL
  // Add a cache-busting parameter to force reload
  return `https://cdn-ultra.esempla.com/storage/${image.UUID}.png?v=${Date.now()}&i=${index}`;
}

// Then use in your Image component:
<Image
  src={getUniqueImageUrl(image, index)}
  alt={image.name || `Product image ${index + 1}`}
  width={80}
  height={80}
  className="w-full h-full object-contain"
/>
```

This ensures each image has a completely unique URL that bypasses any caching issues.
