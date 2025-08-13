import { Skeleton } from "@/components/ui/skeleton";

const BookingSkeleton = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-10 w-36 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="w-full h-[400px] rounded-lg" />
          <div className="p-6 border rounded-lg">
            <Skeleton className="h-9 w-3/4 mb-2" />
            <Skeleton className="h-6 w-full mb-6" />
            <div className="border-t pt-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="mt-6">
                <Skeleton className="h-7 w-1/4 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-8 p-6 border rounded-lg">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2 mb-4" />
            <Skeleton className="w-full h-72 mb-4" />
            <Skeleton className="w-full h-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSkeleton;