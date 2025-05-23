import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove, push, child, update } from "firebase/database";
import type { 
  Tutorial, InsertTutorial, 
  Tag, InsertTag, 
  Note, InsertNote, 
  CommunityPost, InsertCommunityPost,
  CommunityComment, InsertCommunityComment
} from "@shared/schema";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXggS45GgtQEDKt7ylTmKMXIg2PPfmCB4",
  authDomain: "flute-notes-f985e.firebaseapp.com",
  databaseURL: "https://flute-notes-f985e-default-rtdb.firebaseio.com",
  projectId: "flute-notes-f985e",
  storageBucket: "flute-notes-f985e.firebasestorage.app",
  messagingSenderId: "461328034114",
  appId: "1:461328034114:web:6bc32ef02899cd0932c0db",
  measurementId: "G-NCP8XDCGBD"
};

console.log('Initializing Firebase with config:', JSON.stringify(firebaseConfig));

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  
  database = getDatabase(app);
  console.log('Firebase database initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. See console for details.');
}

// Firebase Database Service
export const firebaseDB = {
  // Cache for data
  _tutorialsCache: null as Tutorial[] | null,
  _notesCache: null as Note[] | null,
  _lastFetchTime: 0,
  
  // Tutorials
  async getAllTutorials(): Promise<Tutorial[]> {
    console.log('Firebase: getAllTutorials called');
    // Use cache if it's less than 10 seconds old
    const now = Date.now();
    if (this._tutorialsCache && now - this._lastFetchTime < 10000) {
      console.log('Firebase: Using cached tutorials data');
      return this._tutorialsCache;
    }
    
    try {
      console.log('Firebase: Fetching tutorials from database');
      const tutorialsRef = ref(database, 'tutorials');
      console.log('Firebase: Tutorial reference created:', tutorialsRef.toString());
      
      const snapshot = await get(tutorialsRef);
      console.log('Firebase: Tutorial snapshot received, exists:', snapshot.exists());
      
      if (snapshot.exists()) {
        const tutorialsObj = snapshot.val();
        console.log('Firebase: Raw tutorials data:', JSON.stringify(tutorialsObj));
        
        const tutorials = Object.keys(tutorialsObj).map(key => ({
          id: parseInt(key),
          ...tutorialsObj[key]
        }));
        
        console.log(`Firebase: Processed ${tutorials.length} tutorials`);
        
        // Update cache
        this._tutorialsCache = tutorials;
        this._lastFetchTime = now;
        
        return tutorials;
      }
      console.log('Firebase: No tutorials found in database');
      return [];
    } catch (error) {
      console.error("Firebase ERROR fetching tutorials:", error);
      throw error; // Don't use cache, throw the error to make the issue visible
    }
  },
  
  // Notes
  async getAllNotes(): Promise<Note[]> {
    console.log('Firebase: getAllNotes called');
    try {
      console.log('Firebase: Fetching notes from database');
      const notesRef = ref(database, 'notes');
      console.log('Firebase: Notes reference created:', notesRef.toString());
      
      const snapshot = await get(notesRef);
      console.log('Firebase: Notes snapshot received, exists:', snapshot.exists());
      
      if (snapshot.exists()) {
        const notesObj = snapshot.val();
        console.log('Firebase: Raw notes data:', JSON.stringify(notesObj));
        
        const notes = Object.keys(notesObj).map(key => ({
          id: parseInt(key),
          ...notesObj[key]
        }));
        
        console.log(`Firebase: Processed ${notes.length} notes`);
        
        // Update cache
        this._notesCache = notes;
        
        return notes;
      }
      console.log('Firebase: No notes found in database');
      return [];
    } catch (error) {
      console.error("Firebase ERROR fetching notes:", error);
      throw error; // Don't use cache, throw the error to make the issue visible
    }
  },
  
  async getTutorial(id: number): Promise<Tutorial | undefined> {
    try {
      const tutorialRef = ref(database, `tutorials/${id}`);
      const snapshot = await get(tutorialRef);
      
      if (snapshot.exists()) {
        return {
          id,
          ...snapshot.val()
        };
      }
      return undefined;
    } catch (error) {
      console.error(`Error fetching tutorial ${id}:`, error);
      return undefined;
    }
  },
  
  async createTutorial(tutorial: Tutorial): Promise<boolean> {
    try {
      // Save tutorial directly to Firebase using its existing ID
      await set(ref(database, `tutorials/${tutorial.id}`), {
        title: tutorial.title,
        description: tutorial.description || null,
        thumbnailUrl: tutorial.thumbnailUrl || null,
        videoUrl: tutorial.videoUrl || null,
        websiteUrl: tutorial.websiteUrl || null,
        source: tutorial.source || null,
        category: tutorial.category || 'learning', // Default to learning if not specified
        duration: tutorial.duration || null,
        authorId: tutorial.authorId || null,
        createdAt: tutorial.createdAt || new Date()
      });
      console.log(`New tutorial directly saved to Firebase`);
      return true;
    } catch (error) {
      console.error("Error saving tutorial to Firebase:", error);
      return false;
    }
  },
  
  async deleteTutorial(id: number): Promise<boolean> {
    try {
      await remove(ref(database, `tutorials/${id}`));
      // Also remove related tags
      await remove(ref(database, `tutorialTags/${id}`));
      return true;
    } catch (error) {
      console.error(`Error deleting tutorial ${id}:`, error);
      return false;
    }
  },
  
  async updateTutorial(id: number, tutorialData: Partial<InsertTutorial>): Promise<Tutorial | undefined> {
    try {
      const tutorialRef = ref(database, `tutorials/${id}`);
      const snapshot = await get(tutorialRef);
      
      if (!snapshot.exists()) {
        return undefined;
      }
      
      const currentTutorial = snapshot.val();
      const updatedTutorial = {
        ...currentTutorial,
        ...tutorialData
      };
      
      await update(tutorialRef, updatedTutorial);
      
      return {
        id,
        ...updatedTutorial
      };
    } catch (error) {
      console.error(`Error updating tutorial ${id}:`, error);
      return undefined;
    }
  },
  
  // Tags
  async getAllTags(): Promise<Tag[]> {
    try {
      const tagsRef = ref(database, 'tags');
      const snapshot = await get(tagsRef);
      
      if (snapshot.exists()) {
        const tagsObj = snapshot.val();
        return Object.keys(tagsObj).map(key => ({
          id: parseInt(key),
          ...tagsObj[key]
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  },
  
  // Tutorial Tags
  async getTutorialTags(tutorialId: number): Promise<Tag[]> {
    try {
      const tutorialTagsRef = ref(database, `tutorialTags/${tutorialId}`);
      const snapshot = await get(tutorialTagsRef);
      
      if (snapshot.exists()) {
        const tagIds = Object.values(snapshot.val());
        const tags: Tag[] = [];
        
        for (const tagId of tagIds) {
          const tagRef = ref(database, `tags/${tagId}`);
          const tagSnapshot = await get(tagRef);
          
          if (tagSnapshot.exists()) {
            tags.push({
              id: parseInt(tagId as string),
              ...tagSnapshot.val()
            });
          }
        }
        
        return tags;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching tags for tutorial ${tutorialId}:`, error);
      return [];
    }
  },

  // Notes
  async createNote(note: Note): Promise<boolean> {
    try {
      // Save note directly to Firebase
      await set(ref(database, `notes/${note.id}`), {
        title: note.title,
        content: note.content,
        tutorialId: note.tutorialId || null,
        userId: note.userId || null,
        createdAt: note.createdAt || new Date(),
        updatedAt: note.updatedAt || new Date()
      });
      console.log(`Note ${note.id} saved to Firebase`);
      return true;
    } catch (error) {
      console.error(`Error creating note in Firebase:`, error);
      return false;
    }
  },

  async deleteNote(id: number): Promise<boolean> {
    try {
      await remove(ref(database, `notes/${id}`));
      // Also remove related comments
      await remove(ref(database, `noteComments/${id}`));
      return true;
    } catch (error) {
      console.error(`Error deleting note ${id} from Firebase:`, error);
      return false;
    }
  },
  
  // Community Posts
  _communityPostsCache: null as CommunityPost[] | null,
  _lastPostsFetchTime: 0,
  
  async getAllCommunityPosts(): Promise<CommunityPost[]> {
    // Use cache if it's less than 10 seconds old
    const now = Date.now();
    if (this._communityPostsCache && now - this._lastPostsFetchTime < 10000) {
      return this._communityPostsCache;
    }
    
    try {
      const postsRef = ref(database, 'communityPosts');
      const snapshot = await get(postsRef);
      
      if (snapshot.exists()) {
        const postsObj = snapshot.val();
        const posts = Object.keys(postsObj).map(key => ({
          id: parseInt(key),
          ...postsObj[key]
        }));
        
        // Sort by createdAt in descending order (newest first)
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Update cache
        this._communityPostsCache = posts;
        this._lastPostsFetchTime = now;
        
        return posts;
      }
      return [];
    } catch (error) {
      console.error("Error fetching community posts:", error);
      return this._communityPostsCache || [];
    }
  },
  
  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    try {
      const postRef = ref(database, `communityPosts/${id}`);
      const snapshot = await get(postRef);
      
      if (snapshot.exists()) {
        return {
          id,
          ...snapshot.val()
        };
      }
      return undefined;
    } catch (error) {
      console.error(`Error fetching community post ${id}:`, error);
      return undefined;
    }
  },
  
  async createCommunityPost(post: CommunityPost): Promise<boolean> {
    try {
      await set(ref(database, `communityPosts/${post.id}`), {
        title: post.title,
        content: post.content,
        userId: post.userId,
        likesCount: post.likesCount || 0,
        createdAt: post.createdAt || new Date()
      });
      
      // Reset cache
      this._communityPostsCache = null;
      this._lastPostsFetchTime = 0;
      
      console.log(`New community post saved to Firebase`);
      return true;
    } catch (error) {
      console.error("Error saving community post to Firebase:", error);
      return false;
    }
  },
  
  async updateCommunityPost(id: number, postData: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    try {
      const postRef = ref(database, `communityPosts/${id}`);
      const snapshot = await get(postRef);
      
      if (!snapshot.exists()) {
        return undefined;
      }
      
      const currentPost = snapshot.val();
      const updatedPost = {
        ...currentPost,
        ...postData
      };
      
      await update(postRef, updatedPost);
      
      // Reset cache
      this._communityPostsCache = null;
      this._lastPostsFetchTime = 0;
      
      return {
        id,
        ...updatedPost
      };
    } catch (error) {
      console.error(`Error updating community post ${id}:`, error);
      return undefined;
    }
  },
  
  async deleteCommunityPost(id: number): Promise<boolean> {
    try {
      await remove(ref(database, `communityPosts/${id}`));
      // Also remove comments for this post
      await remove(ref(database, `communityComments/${id}`));
      
      // Reset cache
      this._communityPostsCache = null;
      this._lastPostsFetchTime = 0;
      
      return true;
    } catch (error) {
      console.error(`Error deleting community post ${id}:`, error);
      return false;
    }
  },
  
  // Community Comments
  async getCommunityComments(postId: number): Promise<CommunityComment[]> {
    try {
      const commentsRef = ref(database, `communityComments/${postId}`);
      const snapshot = await get(commentsRef);
      
      if (snapshot.exists()) {
        const commentsObj = snapshot.val();
        const comments = Object.keys(commentsObj).map(key => ({
          id: parseInt(key),
          ...commentsObj[key]
        }));
        
        // Sort by createdAt ascending order (oldest first in comment threads)
        comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        return comments;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  },
  
  async createCommunityComment(comment: CommunityComment): Promise<boolean> {
    try {
      await set(ref(database, `communityComments/${comment.postId}/${comment.id}`), {
        content: comment.content,
        userId: comment.userId,
        postId: comment.postId,
        likesCount: comment.likesCount || 0,
        createdAt: comment.createdAt || new Date()
      });
      
      console.log(`New comment saved to Firebase`);
      return true;
    } catch (error) {
      console.error("Error saving comment to Firebase:", error);
      return false;
    }
  },
  
  async updateCommentLikes(postId: number, commentId: number, likesCount: number): Promise<boolean> {
    try {
      await update(ref(database, `communityComments/${postId}/${commentId}`), { likesCount });
      return true;
    } catch (error) {
      console.error(`Error updating comment likes:`, error);
      return false;
    }
  },
  
  async updatePostLikes(postId: number, likesCount: number): Promise<boolean> {
    try {
      await update(ref(database, `communityPosts/${postId}`), { likesCount });
      // Reset cache
      this._communityPostsCache = null;
      this._lastPostsFetchTime = 0;
      return true;
    } catch (error) {
      console.error(`Error updating post likes:`, error);
      return false;
    }
  },
  
  // Sync data from in-memory to Firebase
  async syncMemoryToFirebase(tutorials: Tutorial[], tags: Tag[], notes: Note[] = []): Promise<void> {
    try {
      console.log("Starting Firebase sync with", tutorials.length, "tutorials and", notes.length, "notes");
      
      // We won't clear existing data anymore to ensure we don't lose data
      // Instead we'll update the tutorials, tags, and notes
      
      // Add tutorials
      const tutorialsObj: Record<string, Omit<Tutorial, 'id'>> = {};
      tutorials.forEach(tutorial => {
        tutorialsObj[tutorial.id.toString()] = {
          title: tutorial.title,
          description: tutorial.description || null,
          source: tutorial.source || null,
          duration: tutorial.duration || null,
          videoUrl: tutorial.videoUrl || null,
          websiteUrl: tutorial.websiteUrl || null, 
          thumbnailUrl: tutorial.thumbnailUrl || null,
          category: tutorial.category || 'learning', // Default to learning if not specified
          createdAt: tutorial.createdAt || new Date(),
          authorId: tutorial.authorId || null
        };
      });
      
      // Write tutorials to Firebase
      await set(ref(database, 'tutorials'), tutorialsObj);
      
      // Add tags
      const tagsObj: Record<string, Omit<Tag, 'id'>> = {};
      tags.forEach(tag => {
        tagsObj[tag.id.toString()] = {
          name: tag.name,
          color: tag.color || null,
          category: tag.category
        };
      });
      
      // Write tags to Firebase
      await set(ref(database, 'tags'), tagsObj);
      
      // Add notes if provided
      if (notes && notes.length > 0) {
        const notesObj: Record<string, Omit<Note, 'id'>> = {};
        notes.forEach(note => {
          notesObj[note.id.toString()] = {
            title: note.title,
            content: note.content,
            tutorialId: note.tutorialId || null,
            userId: note.userId || null,
            createdAt: note.createdAt || new Date(),
            updatedAt: note.updatedAt || new Date()
          };
        });
        
        // Write notes to Firebase
        await set(ref(database, 'notes'), notesObj);
      }
      
      // Invalidate cache to ensure fresh data on next fetch
      this._tutorialsCache = null;
      this._notesCache = null;
      this._lastFetchTime = 0;
      
      console.log("Data successfully synced to Firebase");
    } catch (error) {
      console.error("Error syncing data to Firebase:", error);
      throw error;
    }
  }
};