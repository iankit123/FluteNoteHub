// Seed data for Netlify functions
exports.users = [
  {
    id: 1,
    username: "emma",
    password: "password123",
    displayName: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?img=1",
    isInstructor: true
  },
  {
    id: 2,
    username: "james",
    password: "password123",
    displayName: "James Smith",
    avatar: "https://i.pravatar.cc/150?img=2",
    isInstructor: false
  },
  {
    id: 3,
    username: "sophia",
    password: "password123",
    displayName: "Sophia Chen",
    avatar: "https://i.pravatar.cc/150?img=3",
    isInstructor: true
  }
];

exports.tutorials = [
  {
    id: 1,
    title: "Beginner Flute Techniques",
    description: "Learn the basics of playing the flute with proper technique.",
    thumbnailUrl: "https://example.com/images/beginner-flute.jpg",
    videoUrl: "https://example.com/videos/beginner-flute.mp4",
    category: "beginner",
    authorId: 1,
    createdAt: new Date("2025-01-15"),
    duration: "15:30"
  },
  {
    id: 2,
    title: "Intermediate Flute Exercises",
    description: "Take your flute playing to the next level with these exercises.",
    thumbnailUrl: "https://example.com/images/intermediate-flute.jpg",
    videoUrl: "https://example.com/videos/intermediate-flute.mp4",
    category: "intermediate",
    authorId: 3,
    createdAt: new Date("2025-02-10"),
    duration: "22:15"
  },
  {
    id: 3,
    title: "Advanced Flute Techniques",
    description: "Master advanced flute techniques and expressions.",
    thumbnailUrl: "https://example.com/images/advanced-flute.jpg",
    videoUrl: "https://example.com/videos/advanced-flute.mp4",
    category: "advanced",
    authorId: 3,
    createdAt: new Date("2025-03-05"),
    duration: "30:45"
  },
  {
    id: 4,
    title: "Flute Maintenance Tips",
    description: "Learn how to properly maintain and care for your flute.",
    thumbnailUrl: "https://example.com/images/flute-maintenance.jpg",
    videoUrl: "https://example.com/videos/flute-maintenance.mp4",
    category: "maintenance",
    authorId: 1,
    createdAt: new Date("2025-04-20"),
    duration: "18:20"
  }
];

exports.tags = [
  { id: 1, name: "Beginner", category: "level", color: "#4CAF50" },
  { id: 2, name: "Intermediate", category: "level", color: "#2196F3" },
  { id: 3, name: "Advanced", category: "level", color: "#F44336" },
  { id: 4, name: "Technique", category: "content", color: "#9C27B0" },
  { id: 5, name: "Exercises", category: "content", color: "#FF9800" },
  { id: 6, name: "Maintenance", category: "content", color: "#795548" },
  { id: 7, name: "Classical", category: "genre", color: "#607D8B" },
  { id: 8, name: "Contemporary", category: "genre", color: "#E91E63" },
  { id: 9, name: "Folk", category: "genre", color: "#FFEB3B" }
];

exports.notes = [
  {
    id: 1,
    title: "My First Flute Practice Notes",
    content: "Today I practiced the basic fingering for C, D, and E notes. I need to work on my breath control.",
    tutorialId: 1,
    userId: 2,
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20")
  }
];
