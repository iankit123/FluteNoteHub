import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  isInstructor: boolean("is_instructor").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatar: true,
  isInstructor: true,
});

// Tutorial model
export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  websiteUrl: text("website_url"),
  source: text("source").default("youtube"), // youtube, personal, website, community
  category: text("category").default("learning"), // "learning" or "music"
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  duration: text("duration"), // e.g. "12:45"
});

export const insertTutorialSchema = createInsertSchema(tutorials).pick({
  title: true,
  description: true,
  thumbnailUrl: true,
  videoUrl: true,
  websiteUrl: true,
  source: true,
  category: true,
  authorId: true,
  duration: true,
});

// Tags model
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // level, technique, genre
  color: text("color").default("#6C3FC9"),
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  category: true,
  color: true,
});

// Tutorial-tag relationship
export const tutorialTags = pgTable("tutorial_tags", {
  id: serial("id").primaryKey(),
  tutorialId: integer("tutorial_id").references(() => tutorials.id),
  tagId: integer("tag_id").references(() => tags.id),
});

export const insertTutorialTagSchema = createInsertSchema(tutorialTags).pick({
  tutorialId: true,
  tagId: true,
});

// Notes model
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tutorialId: integer("tutorial_id").references(() => tutorials.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  tutorialId: true,
  userId: true,
});

// Comments model
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  tutorialId: integer("tutorial_id").references(() => tutorials.id).notNull(),
  noteId: integer("note_id").references(() => notes.id),
  parentId: integer("parent_id").references(() => comments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  userId: true,
  tutorialId: true,
  noteId: true,
  parentId: true,
});

// Favorites/Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  tutorialId: integer("tutorial_id").references(() => tutorials.id),
  noteId: integer("note_id").references(() => notes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  userId: true,
  tutorialId: true,
  noteId: true,
});

// Community posts
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  category: text("category").notNull(), // question, tutorial, performance, resource
  createdAt: timestamp("created_at").defaultNow(),
  likesCount: integer("likes_count").default(0),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).pick({
  title: true,
  content: true,
  userId: true,
  category: true,
  likesCount: true,
});

// Community post tags
export const communityPostTags = pgTable("community_post_tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => communityPosts.id),
  tagId: integer("tag_id").references(() => tags.id),
});

export const insertCommunityPostTagSchema = createInsertSchema(communityPostTags).pick({
  postId: true,
  tagId: true,
});

// Community comments
export const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  postId: integer("post_id").references(() => communityPosts.id),
  parentId: integer("parent_id").references(() => communityComments.id),
  createdAt: timestamp("created_at").defaultNow(),
  likesCount: integer("likes_count").default(0),
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).pick({
  content: true,
  userId: true,
  postId: true,
  parentId: true,
  likesCount: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tutorial = typeof tutorials.$inferSelect;
export type InsertTutorial = z.infer<typeof insertTutorialSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type TutorialTag = typeof tutorialTags.$inferSelect;
export type InsertTutorialTag = z.infer<typeof insertTutorialTagSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;

export type CommunityPostTag = typeof communityPostTags.$inferSelect;
export type InsertCommunityPostTag = z.infer<typeof insertCommunityPostTagSchema>;

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
