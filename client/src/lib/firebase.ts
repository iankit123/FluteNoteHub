import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove, push, child, update } from "firebase/database";
import type { Tutorial, InsertTutorial, Tag, InsertTag, Note, InsertNote } from "@shared/schema";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXggS45GgtQEDKt7ylTmKMXIg2PPfmCB4",
  authDomain: "flute-notes-f985e.firebaseapp.com",
  projectId: "flute-notes-f985e",
  databaseURL: "https://flute-notes-f985e-default-rtdb.firebaseio.com",
  storageBucket: "flute-notes-f985e.firebasestorage.app",
  messagingSenderId: "461328034114",
  appId: "1:461328034114:web:6bc32ef02899cd0932c0db",
  measurementId: "G-NCP8XDCGBD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Firebase Database Service
export const firebaseDB = {
  // Cache for tutorials
  _tutorialsCache: null as Tutorial[] | null,
  _lastFetchTime: 0,
  
  // Tutorials
  async getAllTutorials(): Promise<Tutorial[]> {
    // Use cache if it's less than 10 seconds old
    const now = Date.now();
    if (this._tutorialsCache && now - this._lastFetchTime < 10000) {
      return this._tutorialsCache;
    }
    
    try {
      const tutorialsRef = ref(database, 'tutorials');
      const snapshot = await get(tutorialsRef);
      
      if (snapshot.exists()) {
        const tutorialsObj = snapshot.val();
        const tutorials = Object.keys(tutorialsObj).map(key => ({
          id: parseInt(key),
          ...tutorialsObj[key]
        }));
        
        // Update cache
        this._tutorialsCache = tutorials;
        this._lastFetchTime = now;
        
        return tutorials;
      }
      return [];
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      return this._tutorialsCache || [];
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
  
  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    try {
      // First, get the highest ID to ensure we increment properly
      const tutorialsRef = ref(database, 'tutorials');
      const snapshot = await get(tutorialsRef);
      
      let nextId = 1;
      if (snapshot.exists()) {
        const tutorialsObj = snapshot.val();
        const ids = Object.keys(tutorialsObj).map(id => parseInt(id));
        nextId = Math.max(...ids, 0) + 1;
      }
      
      const now = new Date();
      
      // Ensure all properties are properly defined with null fallbacks
      const newTutorial: Tutorial = {
        id: nextId,
        title: tutorial.title,
        description: tutorial.description ?? null,
        thumbnailUrl: tutorial.thumbnailUrl ?? null,
        videoUrl: tutorial.videoUrl ?? null,
        websiteUrl: tutorial.websiteUrl ?? null,
        source: tutorial.source ?? null,
        duration: tutorial.duration ?? null,
        authorId: tutorial.authorId ?? null,
        createdAt: now
      };
      
      await set(ref(database, `tutorials/${nextId}`), newTutorial);
      return newTutorial;
    } catch (error) {
      console.error("Error creating tutorial:", error);
      throw error;
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
  
  // Sync data from in-memory to Firebase
  async syncMemoryToFirebase(tutorials: Tutorial[], tags: Tag[]): Promise<void> {
    try {
      console.log("Starting Firebase sync with", tutorials.length, "tutorials");
      
      // We won't clear existing data anymore to ensure we don't lose data
      // Instead we'll update the tutorials and tags
      
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
      
      // Invalidate cache to ensure fresh data on next fetch
      this._tutorialsCache = null;
      this._lastFetchTime = 0;
      
      console.log("Data successfully synced to Firebase");
    } catch (error) {
      console.error("Error syncing data to Firebase:", error);
      throw error;
    }
  }
};