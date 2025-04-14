import express, { type Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTutorialSchema, 
  insertTagSchema,
  insertTutorialTagSchema,
  insertNoteSchema,
  insertCommentSchema,
  insertBookmarkSchema,
  insertCommunityPostSchema,
  insertCommunityPostTagSchema,
  insertCommunityCommentSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // User routes
  apiRouter.post("/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  apiRouter.post("/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Tutorial routes
  apiRouter.get("/tutorials", async (req, res) => {
    try {
      const tutorials = await storage.getAllTutorials();
      res.json(tutorials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutorials" });
    }
  });

  apiRouter.get("/tutorials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tutorial = await storage.getTutorial(id);
      
      if (!tutorial) {
        return res.status(404).json({ message: "Tutorial not found" });
      }
      
      res.json(tutorial);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutorial" });
    }
  });

  apiRouter.post("/tutorials", async (req, res) => {
    try {
      const tutorialData = insertTutorialSchema.parse(req.body);
      const tutorial = await storage.createTutorial(tutorialData);
      res.status(201).json(tutorial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tutorial data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tutorial" });
      }
    }
  });

  apiRouter.put("/tutorials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tutorialData = insertTutorialSchema.partial().parse(req.body);
      const tutorial = await storage.updateTutorial(id, tutorialData);
      
      if (!tutorial) {
        return res.status(404).json({ message: "Tutorial not found" });
      }
      
      res.json(tutorial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tutorial data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update tutorial" });
      }
    }
  });

  apiRouter.delete("/tutorials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTutorial(id);
      
      if (!success) {
        return res.status(404).json({ message: "Tutorial not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tutorial" });
    }
  });

  // Tag routes
  apiRouter.get("/tags", async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  apiRouter.post("/tags", async (req, res) => {
    try {
      const tagData = insertTagSchema.parse(req.body);
      const existingTag = await storage.getTagByName(tagData.name);
      
      if (existingTag) {
        return res.status(400).json({ message: "Tag already exists" });
      }
      
      const tag = await storage.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tag" });
      }
    }
  });

  // Tutorial-Tag routes
  apiRouter.get("/tutorials/:id/tags", async (req, res) => {
    try {
      const tutorialId = parseInt(req.params.id);
      const tags = await storage.getTutorialTags(tutorialId);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutorial tags" });
    }
  });

  apiRouter.post("/tutorials/:id/tags", async (req, res) => {
    try {
      const tutorialId = parseInt(req.params.id);
      const { tagId } = req.body;
      
      const tutorial = await storage.getTutorial(tutorialId);
      const tag = await storage.getTag(tagId);
      
      if (!tutorial) {
        return res.status(404).json({ message: "Tutorial not found" });
      }
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const tutorialTag = await storage.addTagToTutorial({ tutorialId, tagId });
      res.status(201).json(tutorialTag);
    } catch (error) {
      res.status(500).json({ message: "Failed to add tag to tutorial" });
    }
  });

  apiRouter.delete("/tutorials/:tutorialId/tags/:tagId", async (req, res) => {
    try {
      const tutorialId = parseInt(req.params.tutorialId);
      const tagId = parseInt(req.params.tagId);
      
      const success = await storage.removeTagFromTutorial(tutorialId, tagId);
      
      if (!success) {
        return res.status(404).json({ message: "Tutorial tag not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from tutorial" });
    }
  });

  // Note routes
  apiRouter.get("/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  apiRouter.get("/notes", async (req, res) => {
    try {
      // Get all notes from storage
      const allNotes = [];
      // Combine notes from all users
      const users = await storage.getAllUsers();
      for (const user of users) {
        const userNotes = await storage.getUserNotes(user.id);
        allNotes.push(...userNotes);
      }
      res.json(allNotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });
  
  apiRouter.get("/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });
  
  apiRouter.get("/tutorials/:id/notes", async (req, res) => {
    try {
      const tutorialId = parseInt(req.params.id);
      const notes = await storage.getTutorialNotes(tutorialId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutorial notes" });
    }
  });

  apiRouter.get("/users/:id/notes", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const notes = await storage.getUserNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user notes" });
    }
  });

  apiRouter.post("/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid note data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create note" });
      }
    }
  });

  apiRouter.put("/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const noteData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, noteData);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid note data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update note" });
      }
    }
  });

  apiRouter.delete("/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNote(id);
      
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Comment routes
  apiRouter.get("/tutorials/:id/comments", async (req, res) => {
    try {
      const tutorialId = parseInt(req.params.id);
      const comments = await storage.getTutorialComments(tutorialId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tutorial comments" });
    }
  });

  apiRouter.get("/notes/:id/comments", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const comments = await storage.getNoteComments(noteId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note comments" });
    }
  });

  apiRouter.post("/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  apiRouter.delete("/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteComment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Bookmark routes
  apiRouter.get("/users/:id/bookmarks", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bookmarks" });
    }
  });

  apiRouter.post("/bookmarks", async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse(req.body);
      
      // Check if bookmark already exists
      const existingBookmark = await storage.checkBookmark(
        bookmarkData.userId,
        bookmarkData.tutorialId || undefined,
        bookmarkData.noteId || undefined
      );
      
      if (existingBookmark) {
        return res.status(400).json({ message: "Bookmark already exists" });
      }
      
      const bookmark = await storage.createBookmark(bookmarkData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bookmark" });
      }
    }
  });

  apiRouter.delete("/bookmarks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBookmark(id);
      
      if (!success) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  // Community Post routes
  apiRouter.get("/community-posts", async (req, res) => {
    try {
      const posts = await storage.getAllCommunityPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  apiRouter.get("/community-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getCommunityPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Community post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community post" });
    }
  });

  apiRouter.post("/community-posts", async (req, res) => {
    try {
      const postData = insertCommunityPostSchema.parse(req.body);
      const post = await storage.createCommunityPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid community post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create community post" });
      }
    }
  });

  apiRouter.put("/community-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const postData = insertCommunityPostSchema.partial().parse(req.body);
      const post = await storage.updateCommunityPost(id, postData);
      
      if (!post) {
        return res.status(404).json({ message: "Community post not found" });
      }
      
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid community post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update community post" });
      }
    }
  });

  apiRouter.delete("/community-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCommunityPost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Community post not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete community post" });
    }
  });

  // Community Post Tag routes
  apiRouter.get("/community-posts/:id/tags", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const tags = await storage.getCommunityPostTags(postId);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community post tags" });
    }
  });

  apiRouter.post("/community-posts/:id/tags", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const { tagId } = req.body;
      
      const post = await storage.getCommunityPost(postId);
      const tag = await storage.getTag(tagId);
      
      if (!post) {
        return res.status(404).json({ message: "Community post not found" });
      }
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      const postTag = await storage.addTagToCommunityPost({ postId, tagId });
      res.status(201).json(postTag);
    } catch (error) {
      res.status(500).json({ message: "Failed to add tag to community post" });
    }
  });

  apiRouter.delete("/community-posts/:postId/tags/:tagId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const tagId = parseInt(req.params.tagId);
      
      const success = await storage.removeTagFromCommunityPost(postId, tagId);
      
      if (!success) {
        return res.status(404).json({ message: "Community post tag not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from community post" });
    }
  });

  // Community Comment routes
  apiRouter.get("/community-posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommunityPostComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community post comments" });
    }
  });

  apiRouter.post("/community-comments", async (req, res) => {
    try {
      const commentData = insertCommunityCommentSchema.parse(req.body);
      const comment = await storage.createCommunityComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid community comment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create community comment" });
      }
    }
  });

  apiRouter.delete("/community-comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCommunityComment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Community comment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete community comment" });
    }
  });

  // Mount the API router with the /api prefix
  app.use("/api", apiRouter);

  // Create HTTP server
  const httpServer = express();
  httpServer.use(app);

  return httpServer;
}
