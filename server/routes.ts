import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema } from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { randomUUID } from "crypto";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Parse CSV content
function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const csvString = buffer.toString('utf8');
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
}

// Parse XLSX content
function parseXLSX(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
}

// Convert XLSX rows to objects
function xlsxToObjects(rows: any[][]): any[] {
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

// Admin authentication middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({ error: "Admin authentication required" });
    }
    
    const session = await storage.getAdminSession(sessionToken);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired admin session" });
    }
    
    // Add admin info to request
    (req as any).admin = { username: session.username };
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication error" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Find admin user
      const admin = await storage.getUserByUsername(username);
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Create session
      const sessionToken = randomUUID();
      const session = await storage.createAdminSession(username, sessionToken);
      
      res.json({
        message: "Login successful",
        sessionToken,
        username: admin.username
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  app.post("/api/admin/logout", async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');
      if (sessionToken) {
        await storage.deleteAdminSession(sessionToken);
      }
      res.json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  });
  
  app.get("/api/admin/verify", requireAdmin, async (req, res) => {
    res.json({
      authenticated: true,
      username: (req as any).admin.username
    });
  });

  // Get all students
  app.get("/api/students", async (req, res) => {
    try {
      const { search, batch, course, sort } = req.query;
      
      let students = await storage.getAllStudents();
      
      // Apply search filter first
      if (search && typeof search === 'string') {
        const lowerQuery = search.toLowerCase();
        students = students.filter(student =>
          student.name.toLowerCase().includes(lowerQuery) ||
          student.email.toLowerCase().includes(lowerQuery) ||
          student.course.toLowerCase().includes(lowerQuery) ||
          student.batch.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Apply batch and course filters on the current results
      if (batch && typeof batch === 'string') {
        students = students.filter(student => student.batch === batch);
      }
      
      if (course && typeof course === 'string') {
        students = students.filter(student => student.course === course);
      }
      
      // Apply sorting
      if (sort === 'name') {
        students.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'batch') {
        students.sort((a, b) => a.batch.localeCompare(b.batch));
      } else if (sort === 'course') {
        students.sort((a, b) => a.course.localeCompare(b.course));
      }
      
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  // Get single student
  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  // Create new student
  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ error: "Invalid student data" });
    }
  });

  // Upload and import students from CSV/XLSX file (Admin only)
  app.post("/api/admin/students/import", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let parsedData: any[] = [];

      // Parse based on file type
      if (req.file.originalname.endsWith('.csv') || req.file.mimetype === 'text/csv') {
        parsedData = await parseCSV(req.file.buffer);
      } else if (req.file.originalname.endsWith('.xlsx') || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const xlsxRows = parseXLSX(req.file.buffer);
        parsedData = xlsxToObjects(xlsxRows);
      } else {
        return res.status(400).json({ error: "Unsupported file format. Please upload CSV or XLSX files." });
      }

      // Validate and transform data
      const studentsToImport: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        
        try {
          // Map common column names (case insensitive)
          const studentData = {
            name: row.name || row.Name || row.student_name || row['Student Name'] || '',
            email: row.email || row.Email || row.student_email || row['Student Email'] || (row.name ? `${row.name.toLowerCase().replace(/\s+/g, '.')}@university.edu` : '') || '',
            course: row.course || row.Course || row.program || row.Program || row.branch || row.Branch || 'MCA',
            batch: row.batch || row.Batch || row.year || row.Year || row.cohort || row.Cohort || '2024-2026',
            imageUrl: row.imageUrl || row.image_url || row.photo || row.Photo || '',
            linkedinUrl: row.linkedinUrl || row.linkedin_url || row.linkedin || row.LinkedIn || row.profile || row.Profile || ''
          };

          // Validate required fields
          if (!studentData.name.trim()) {
            errors.push(`Row ${i + 1}: Name is required`);
            continue;
          }

          // Validate the data using the schema
          const validatedData = insertStudentSchema.parse(studentData);
          studentsToImport.push(validatedData);
        } catch (error) {
          errors.push(`Row ${i + 1}: Invalid data format`);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({ 
          error: "Data validation failed", 
          details: errors 
        });
      }

      if (studentsToImport.length === 0) {
        return res.status(400).json({ error: "No valid student data found in the file" });
      }

      // Import new data (keep existing data)
      const importedStudents = await storage.importStudents(studentsToImport);

      res.json({
        message: `Successfully imported ${importedStudents.length} students`,
        count: importedStudents.length,
        students: importedStudents
      });

    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ 
        error: "Failed to import students", 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Clear all students (Admin only)
  app.delete("/api/admin/students/all", requireAdmin, async (req, res) => {
    try {
      await storage.clearAllStudents();
      res.json({ message: "All students cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear students" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
