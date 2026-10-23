import PlantLoader from "@/components/customer/common/PlantLoader";

interface LoadingSkeletonProps {
  message?: string;
}

export default function LoadingSkeleton({ message = "Resolving clean URL dynamic asset mappings pipelines..." }: LoadingSkeletonProps) {
  return (
    <div className="w-full text-center py-40 text-slate-400 font-bold text-xs font-mono tracking-widest uppercase">
      {/* <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              {message} */}
      <PlantLoader fullScreen={false} text="Loading details..." />
    </div>
  );
}