import { Skeleton } from "@/components/ui/skeleton";

const IndexSkeleton = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-4">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-5 w-1/2" />
      </header>

      <div className="my-8">
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[55vh] rounded-xl overflow-hidden">
          <Skeleton className="col-span-2 row-span-2 w-full h-full" />
          <Skeleton className="col-span-1 row-span-1 w-full h-full" />
          <Skeleton className="col-span-1 row-span-1 w-full h-full" />
          <Skeleton className="col-span-1 row-span-1 w-full h-full" />
          <Skeleton className="col-span-1 row-span-1 w-full h-full" />
        </div>
      </div>

      <div className="my-16">
        <Skeleton className="h-10 w-1/3 mx-auto mb-2" />
        <Skeleton className="h-5 w-1/2 mx-auto mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="w-full h-56" />
              <div className="p-4">
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-full mb-4" />
              </div>
              <div className="p-4 pt-2 flex justify-between items-center bg-slate-50">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-12 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndexSkeleton;