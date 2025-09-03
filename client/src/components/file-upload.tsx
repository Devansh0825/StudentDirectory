import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Direct fetch for file upload (FormData requires special handling)
      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedFile(null);
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Upload successful!",
        description: `Successfully imported ${data.count} students`,
      });
      onUploadComplete?.();
    },
    onError: (error: any) => {
      setUploadError(error.message || 'Upload failed');
      toast({
        title: "Upload failed",
        description: error.message || 'Please check your file format and try again',
        variant: "destructive",
      });
    }
  });

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/students/all');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Data cleared",
        description: "All student data has been cleared",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to clear data",
        description: error.message || 'Please try again',
        variant: "destructive",
      });
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['.csv', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadError('Please select a CSV or XLSX file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setUploadError('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleClearData = () => {
    clearDataMutation.mutate();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="file-upload-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-cloud-upload-alt text-primary"></i>
          Import Student Data
        </CardTitle>
        <CardDescription>
          Upload a CSV or XLSX file containing student information. Required columns: name, email, course, batch, imageUrl, linkedinUrl
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          data-testid="file-drop-zone"
        >
          <i className="fas fa-file-upload text-4xl text-muted-foreground mb-4"></i>
          <div className="space-y-2">
            <p className="text-lg font-medium">Drop your file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
          <Input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-input"
            data-testid="file-input"
          />
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="button-browse-files"
          >
            <i className="fas fa-folder-open mr-2"></i>
            Browse Files
          </Button>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <Alert data-testid="selected-file-info">
            <i className="fas fa-file-alt"></i>
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  data-testid="button-remove-file"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {uploadError && (
          <Alert variant="destructive" data-testid="upload-error">
            <i className="fas fa-exclamation-triangle"></i>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="flex-1"
            data-testid="button-upload"
          >
            {uploadMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i>
                Import Students
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleClearData}
            disabled={clearDataMutation.isPending}
            data-testid="button-clear-data"
          >
            {clearDataMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Clearing...
              </>
            ) : (
              <>
                <i className="fas fa-trash mr-2"></i>
                Clear All Data
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-muted p-4 rounded-lg" data-testid="upload-instructions">
          <h4 className="font-semibold mb-2">File Format Requirements:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Supported formats: CSV (.csv) or Excel (.xlsx)</li>
            <li>• Required columns: name, email, course, batch</li>
            <li>• Optional columns: imageUrl, linkedinUrl</li>
            <li>• First row should contain column headers</li>
            <li>• Maximum file size: 5MB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}