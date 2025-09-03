import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterSectionProps {
  searchTerm: string;
  selectedBatch: string;
  selectedCourse: string;
  sortBy: string;
  onSearch: (value: string) => void;
  onBatchFilter: (value: string) => void;
  onCourseFilter: (value: string) => void;
  onSort: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterSection({
  searchTerm,
  selectedBatch,
  selectedCourse,
  sortBy,
  onSearch,
  onBatchFilter,
  onCourseFilter,
  onSort,
  onClearFilters,
  hasActiveFilters
}: FilterSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-muted-foreground"></i>
          </div>
          <Input
            type="text"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 search-input"
            data-testid="input-search"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Batch Filter */}
          <Select value={selectedBatch} onValueChange={onBatchFilter}>
            <SelectTrigger className="w-40" data-testid="select-batch">
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="2024-2026">2024-2026</SelectItem>
              <SelectItem value="2023-2025">2023-2025</SelectItem>
              <SelectItem value="2022-2024">2022-2024</SelectItem>
            </SelectContent>
          </Select>

          {/* Course Filter */}
          <Select value={selectedCourse} onValueChange={onCourseFilter}>
            <SelectTrigger className="w-40" data-testid="select-course">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="MCA">MCA</SelectItem>
              <SelectItem value="MBA">MBA</SelectItem>
              <SelectItem value="M.Tech">M.Tech</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Options */}
          <Select value={sortBy} onValueChange={onSort}>
            <SelectTrigger className="w-40" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="batch">Sort by Batch</SelectItem>
              <SelectItem value="course">Sort by Course</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2" data-testid="active-filters">
          {selectedCourse && (
            <Badge variant="default" className="filter-badge">
              {selectedCourse} Course
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 hover:bg-transparent"
                onClick={() => onCourseFilter("all")}
                data-testid="button-remove-course-filter"
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            </Badge>
          )}
          {selectedBatch && (
            <Badge variant="secondary" className="filter-badge">
              Batch {selectedBatch}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 hover:bg-transparent"
                onClick={() => onBatchFilter("all")}
                data-testid="button-remove-batch-filter"
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="outline" className="filter-badge">
              Search: "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 hover:bg-transparent"
                onClick={() => onSearch("")}
                data-testid="button-remove-search-filter"
              >
                <i className="fas fa-times text-xs"></i>
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
