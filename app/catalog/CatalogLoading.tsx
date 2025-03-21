"use client";
import { CatalogLoadingProps } from "./_types";

export default function CatalogLoading({}: CatalogLoadingProps) {
  return (
    <div className="container px-4 py-8">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="h-8 w-60 bg-gray-200 rounded-md animate-pulse mb-4 md:mb-0"></div>
        <div className="flex space-x-2">
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters sidebar skeleton */}
        <div className="hidden md:block">
          <div className="space-y-6">
            {/* Filter section skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-5 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products grid skeleton */}
        <div className="col-span-1 md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-6 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
