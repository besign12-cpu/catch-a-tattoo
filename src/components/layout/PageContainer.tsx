import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
}

export function PageContainer({
  children,
  className,
  withBottomNav = true,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto min-h-screen w-full max-w-mobile bg-neutral-50",
        withBottomNav && "pb-[calc(52px+env(safe-area-inset-bottom))]",
        className
      )}
    >
      {children}
    </main>
  );
}
