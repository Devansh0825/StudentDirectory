import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all students
  app.get("/api/students", async (req, res) => {
    try {
      const { search, batch, course, sort } = req.query;
      
      let students = await storage.getAllStudents();
      
      // Apply search filter
      if (search && typeof search === 'string') {
        students = await storage.searchStudents(search);
      }
      
      // Apply batch and course filters
      if (batch || course) {
        students = await storage.filterStudents(
          batch as string | undefined,
          course as string | undefined
        );
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

  const httpServer = createServer(app);
  return httpServer;
}
