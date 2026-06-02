import { cn } from "@/lib/utils";

interface TopBarProps {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  border?: boolean;
  className?: string;
}

export function TopBar({
  title,
  left,
  right,
  border = true,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-[52px] items-center bg-white px-4",
        border && "border-b border-neutral-100",
        className
      )}
    >
      <div className="flex w-10 items-center justify-start">{left}</div>
      {title && (
        <h1 className="flex-1 text-center text-[13px] font-medium text-neutral-900">
          {title}
        </h1>
      )}
      <div className="flex w-10 items-center justify-end">{right}</div>
    </header>
  );
}
