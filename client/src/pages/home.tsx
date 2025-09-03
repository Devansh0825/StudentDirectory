import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Student } from "@shared/schema";
import Header from "@/components/header";
import FilterSection from "@/components/filter-section";
import StudentCard from "@/components/student-card";
import Footer from "@/components/footer";
import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchTerm) queryParams.set('search', searchTerm);
  if (selectedBatch !== 'all') queryParams.set('batch', selectedBatch);
  if (selectedCourse !== 'all') queryParams.set('course', selectedCourse);
  if (sortBy) queryParams.set('sort', sortBy);
  
  const queryString = queryParams.toString();
  const apiUrl = `/api/students${queryString ? `?${queryString}` : ''}`;

  const { data: students, isLoading, error } = useQuery<Student[]>({
    queryKey: [apiUrl],
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleBatchFilter = (value: string) => {
    setSelectedBatch(value);
  };

  const handleCourseFilter = (value: string) => {
    setSelectedCourse(value);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBatch("all");
    setSelectedCourse("all");
    setSortBy("name");
  };

  const filteredStudents = students || [];
  const hasActiveFilters = Boolean(searchTerm) || selectedBatch !== 'all' || selectedCourse !== 'all';

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header studentCount={0} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-exclamation-triangle text-destructive text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error loading students</h3>
            <p className="text-muted-foreground mb-4">Unable to fetch student data. Please try again later.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header studentCount={filteredStudents.length} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Import Data Button */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Student Directory</h1>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90"
                data-testid="button-import-data"
              >
                <i className="fas fa-upload mr-2"></i>
                Import Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Student Data</DialogTitle>
              </DialogHeader>
              <FileUpload onUploadComplete={() => setUploadDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <FilterSection
          searchTerm={searchTerm}
          selectedBatch={selectedBatch}
          selectedCourse={selectedCourse}
          sortBy={sortBy}
          onSearch={handleSearch}
          onBatchFilter={handleBatchFilter}
          onCourseFilter={handleCourseFilter}
          onSort={handleSort}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="space-y-8">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground" data-testid="text-results-count">
              {isLoading ? "Loading..." : `Showing ${filteredStudents.length} students`}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <i className="fas fa-info-circle"></i>
              <span>Click on LinkedIn to view profiles</span>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-4 w-24 mx-auto mb-2" />
                  <Skeleton className="h-3 w-16 mx-auto mb-2" />
                  <Skeleton className="h-6 w-20 mx-auto mb-4" />
                  <Skeleton className="h-10 w-32 mx-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Students Grid */}
          {!isLoading && filteredStudents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-students">
              {filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredStudents.length === 0 && (
            <div className="text-center py-12" data-testid="empty-state">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-search text-muted-foreground text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
