import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

// Define the type for the components that will be assigned to the Pagination namespace
type PaginationComponentType = React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
> & {
  Content: typeof PaginationContent;
  Item: typeof PaginationItem;
  Link: typeof PaginationLink;
  Ellipsis: typeof PaginationEllipsis;
  PrevButton: typeof PaginationPrevButton;
  NextButton: typeof PaginationNextButton;
};

// Root pagination component
const Pagination = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)) as PaginationComponentType;
Pagination.displayName = "Pagination"

// Content container
const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent"

// Individual item wrapper
const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem"

// Link element or button
type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ButtonHTMLAttributes<HTMLButtonElement>

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <button
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "default" : "outline",
        size,
      }),
      isActive && "pointer-events-none",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

// Ellipsis for truncation
const PaginationEllipsis = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    aria-hidden
    className={cn(
      "flex h-9 w-9 items-center justify-center",
      className
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

// Previous page button
const PaginationPrevButton = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
  </PaginationLink>
)
PaginationPrevButton.displayName = "PaginationPrevButton"

// Next page button
const PaginationNextButton = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNextButton.displayName = "PaginationNextButton"

// Attach all components to the Pagination namespace
Pagination.Content = PaginationContent
Pagination.Item = PaginationItem
Pagination.Link = PaginationLink
Pagination.Ellipsis = PaginationEllipsis
Pagination.PrevButton = PaginationPrevButton
Pagination.NextButton = PaginationNextButton

export { Pagination }
