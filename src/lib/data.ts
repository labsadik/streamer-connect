
import { User, Video, Comment } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Mock Users
export const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random",
    subscribers: 152000,
  },
  {
    id: "2",
    name: "Jane Smith",
    username: "janesmith",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=random",
    subscribers: 89000,
  },
  {
    id: "3",
    name: "Tech Insider",
    username: "techinsider",
    avatar: "https://ui-avatars.com/api/?name=Tech+Insider&background=random",
    subscribers: 1200000,
  },
  {
    id: "4",
    name: "Travel Diaries",
    username: "traveldiaries",
    avatar: "https://ui-avatars.com/api/?name=Travel+Diaries&background=random",
    subscribers: 456000,
  },
  {
    id: "5",
    name: "Cooking Master",
    username: "cookingmaster",
    avatar: "https://ui-avatars.com/api/?name=Cooking+Master&background=random",
    subscribers: 780000,
  },
];

// Mock Videos
export const videos: Video[] = [
  {
    id: "1",
    title: "Introduction to Web Development in 2023",
    description: "Learn the basics of web development in this comprehensive guide for beginners.",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=280&fit=crop",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    views: 1250000,
    createdAt: "2023-08-12T15:30:00Z",
    duration: 895, // in seconds
    userId: "3",
    likes: 45600,
    dislikes: 1200,
  },
  {
    id: "2",
    title: "Bali Travel Guide: Hidden Gems",
    description: "Discover the secret spots in Bali that most tourists never get to see.",
    thumbnail: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=280&fit=crop",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
    views: 876000,
    createdAt: "2023-09-05T08:45:00Z",
    duration: 1250, // in seconds
    userId: "4",
    likes: 32400,
    dislikes: 800,
  },
  {
    id: "3",
    title: "Perfect Pasta Carbonara Recipe",
    description: "Master the classic Italian dish with these simple steps.",
    thumbnail: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=500&h=280&fit=crop",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
    views: 543000,
    createdAt: "2023-07-28T12:15:00Z",
    duration: 720, // in seconds
    userId: "5",
    likes: 28900,
    dislikes: 600,
  },
  {
    id: "4",
    title: "iPhone 15 Pro: Honest Review",
    description: "A detailed look at Apple's latest flagship phone.",
    thumbnail: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&h=280&fit=crop",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
    views: 2100000,
    createdAt: "2023-10-01T10:30:00Z",
    duration: 1080, // in seconds
    userId: "3",
    likes: 78500,
    dislikes: 3200,
  },
  {
    id: "5",
    title: "Morning Routine for Productivity",
    description: "Start your day right with these 5 habits that boost productivity.",
    thumbnail: "https://images.unsplash.com/photo-1540929255252-95a9c8cf6175?w=500&h=280&fit=crop",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
    views: 732000,
    createdAt: "2023-08-25T07:20:00Z",
    duration: 685, // in seconds
    userId: "2",
    likes: 41200,
    dislikes: 950,
  },
  {
    id: "6",
    title: "React vs Vue in 2023: Which to Choose?",
    description: "An in-depth comparison of two popular frontend frameworks.",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=280&fit=crop",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    views: 965000,
    createdAt: "2023-09-18T14:45:00Z",
    duration: 1450, // in seconds
    userId: "1",
    likes: 52300,
    dislikes: 1800,
  },
  {
    id: "7",
    title: "New York City: A Local's Guide",
    description: "Explore NYC like a local with these insider tips.",
    thumbnail: "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=500&h=280&fit=crop",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
    views: 823000,
    createdAt: "2023-08-10T09:15:00Z",
    duration: 1320, // in seconds
    userId: "4",
    likes: 38700,
    dislikes: 1100,
  },
  {
    id: "8",
    title: "Easy 15-Minute Desserts",
    description: "Quick and delicious dessert recipes that anyone can make.",
    thumbnail: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=280&fit=crop",
    videoUrl: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
    views: 612000,
    createdAt: "2023-09-25T11:50:00Z",
    duration: 845, // in seconds
    userId: "5",
    likes: 29800,
    dislikes: 750,
  },
];

// Mock Comments
export const comments: Comment[] = [
  {
    id: "1",
    content: "Great video! Really helpful content.",
    userId: "2",
    videoId: "1",
    createdAt: "2023-08-13T10:20:00Z",
  },
  {
    id: "2",
    content: "I learned so much from this, thank you!",
    userId: "4",
    videoId: "1",
    createdAt: "2023-08-14T09:35:00Z",
  },
  {
    id: "3",
    content: "The views in Bali look amazing! Adding this to my travel list.",
    userId: "1",
    videoId: "2",
    createdAt: "2023-09-06T15:40:00Z",
  },
  {
    id: "4",
    content: "Made this pasta last night, it was delicious!",
    userId: "3",
    videoId: "3",
    createdAt: "2023-07-29T18:25:00Z",
  },
  {
    id: "5",
    content: "Great review! I'm definitely getting the new iPhone now.",
    userId: "5",
    videoId: "4",
    createdAt: "2023-10-02T11:15:00Z",
  },
];

// Helper functions to retrieve and manipulate data
export const getVideoWithUser = async (videoId: string): Promise<Video | undefined> => {
  try {
    // First, try to fetch from Supabase
    const { data: videoData, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) {
      console.error("Error fetching from Supabase:", error);
      // Fall back to mock data if no results from Supabase
      const mockVideo = videos.find((v) => v.id === videoId);
      if (!mockVideo) return undefined;
      
      return { 
        ...mockVideo, 
        user: users.find((u) => u.id === mockVideo.userId) 
      };
    }
    
    // Transform Supabase data to match our Video type
    if (videoData) {
      // Fetch user data
      const userId = videoData.user_id;
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Create user object with appropriate avatar
      const userObject = userData ? {
        id: userData.id,
        name: userData.username || "Unknown User",
        username: userData.username || "user",
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.username || "Unknown"}&background=random`,
        subscribers: 0
      } : undefined;
      
      return {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description || "",
        thumbnail: videoData.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=280&fit=crop",
        videoUrl: videoData.video_url,
        views: videoData.views,
        createdAt: videoData.created_at,
        duration: videoData.duration,
        userId: videoData.user_id,
        user: userObject,
        likes: videoData.likes,
        dislikes: videoData.dislikes
      };
    }
    
    return undefined;
  } catch (error) {
    console.error("Error in getVideoWithUser:", error);
    return undefined;
  }
};

export const getVideosByUser = async (userId: string): Promise<Video[]> => {
  try {
    // Try to fetch from Supabase first
    const { data: videosData, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching from Supabase:", error);
      // Fall back to mock data
      return videos
        .filter((video) => video.userId === userId)
        .map((video) => ({
          ...video,
          user: users.find((u) => u.id === video.userId),
        }));
    }

    if (videosData && videosData.length > 0) {
      // Get user data
      const user = await getUser(userId);
      
      // Map Supabase data to our Video type
      return videosData.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || "",
        thumbnail: video.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=280&fit=crop",
        videoUrl: video.video_url,
        views: video.views,
        createdAt: video.created_at,
        duration: video.duration,
        userId: video.user_id,
        user: user,
        likes: video.likes,
        dislikes: video.dislikes
      }));
    }
    
    // Fall back to mock data if no results
    return videos
      .filter((video) => video.userId === userId)
      .map((video) => ({
        ...video,
        user: users.find((u) => u.id === video.userId),
      }));
  } catch (error) {
    console.error("Error in getVideosByUser:", error);
    // Fall back to mock data on error
    return videos
      .filter((video) => video.userId === userId)
      .map((video) => ({
        ...video,
        user: users.find((u) => u.id === video.userId),
      }));
  }
};

export const getCommentsForVideo = (videoId: string): Comment[] => {
  return comments
    .filter((comment) => comment.videoId === videoId)
    .map((comment) => ({
      ...comment,
      user: users.find((u) => u.id === comment.userId),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getUser = async (userId: string): Promise<User | undefined> => {
  try {
    // First check if user exists in Supabase
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user from Supabase:", error);
      // Fall back to mock data
      return users.find((user) => user.id === userId);
    }

    if (userData) {
      return {
        id: userData.id,
        name: userData.username || "Unknown User",
        username: userData.username || "user",
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.username || "Unknown"}&background=random`,
        subscribers: 0
      };
    }
    
    // Fall back to mock data if no results
    return users.find((user) => user.id === userId);
  } catch (error) {
    console.error("Error in getUser:", error);
    // Fall back to mock data on error
    return users.find((user) => user.id === userId);
  }
};

export const getAllVideos = async (): Promise<Video[]> => {
  try {
    // Try to fetch from Supabase first
    const { data: videosData, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching from Supabase:", error);
      // Fall back to mock data
      return videos.map((video) => ({
        ...video,
        user: users.find((u) => u.id === video.userId),
      }));
    }

    if (videosData && videosData.length > 0) {
      // Get all user IDs
      const userIds = [...new Set(videosData.map(video => video.user_id))];
      
      // Fetch all users in one query
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      const userMap = new Map();
      if (usersData) {
        usersData.forEach(user => {
          userMap.set(user.id, {
            id: user.id,
            name: user.username || "Unknown User",
            username: user.username || "user",
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.username || "Unknown"}&background=random`,
            subscribers: 0
          });
        });
      }
      
      // Map Supabase data to our Video type
      return videosData.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || "",
        thumbnail: video.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=280&fit=crop",
        videoUrl: video.video_url,
        views: video.views,
        createdAt: video.created_at,
        duration: video.duration,
        userId: video.user_id,
        user: userMap.get(video.user_id) || users.find(u => u.id === video.user_id),
        likes: video.likes,
        dislikes: video.dislikes
      }));
    }
    
    // If no Supabase videos, fall back to mock data
    if (videosData && videosData.length === 0) {
      // Combine with mock data
      return videos.map((video) => ({
        ...video,
        user: users.find((u) => u.id === video.userId),
      }));
    }
    
    // Fall back to mock data if no results
    return videos.map((video) => ({
      ...video,
      user: users.find((u) => u.id === video.userId),
    }));
  } catch (error) {
    console.error("Error in getAllVideos:", error);
    // Fall back to mock data on error
    return videos.map((video) => ({
      ...video,
      user: users.find((u) => u.id === video.userId),
    }));
  }
};

export const getTrendingVideos = async (): Promise<Video[]> => {
  try {
    // Try to fetch from Supabase first, ordered by views
    const { data: videosData, error } = await supabase
      .from('videos')
      .select('*')
      .order('views', { ascending: false })
      .limit(4);

    if (error) {
      console.error("Error fetching from Supabase:", error);
      // Fall back to mock data
      return [...videos]
        .sort((a, b) => b.views - a.views)
        .slice(0, 4)
        .map((video) => ({
          ...video,
          user: users.find((u) => u.id === video.userId),
        }));
    }
    
    if (videosData && videosData.length > 0) {
      // Get all user IDs
      const userIds = [...new Set(videosData.map(video => video.user_id))];
      
      // Fetch all users in one query
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      const userMap = new Map();
      if (usersData) {
        usersData.forEach(user => {
          userMap.set(user.id, {
            id: user.id,
            name: user.username || "Unknown User",
            username: user.username || "user",
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.username || "Unknown"}&background=random`,
            subscribers: 0
          });
        });
      }
      
      // Map Supabase data to our Video type
      return videosData.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || "",
        thumbnail: video.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=280&fit=crop",
        videoUrl: video.video_url,
        views: video.views,
        createdAt: video.created_at,
        duration: video.duration,
        userId: video.user_id,
        user: userMap.get(video.user_id) || users.find(u => u.id === video.user_id),
        likes: video.likes,
        dislikes: video.dislikes
      }));
    }
    
    // If no results or not enough, fall back to mock data
    return [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 4)
      .map((video) => ({
        ...video,
        user: users.find((u) => u.id === video.userId),
      }));
  } catch (error) {
    console.error("Error in getTrendingVideos:", error);
    // Fall back to mock data on error
    return [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 4)
      .map((video) => ({
        ...video,
        user: users.find((u) => u.id === video.userId),
      }));
  }
};

export const getRecentVideos = async (): Promise<Video[]> => {
  try {
    // Try to fetch from Supabase first
    const { data: videosData, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching from Supabase:", error);
      // Fall back to mock data
      return [...videos]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((video) => ({
          ...video,
          user: users.find((u) => u.id === video.userId),
        }));
    }
    
    if (videosData && videosData.length > 0) {
      // Get all user IDs
      const userIds = [...new Set(videosData.map(video => video.user_id))];
      
      // Fetch all users in one query
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      const userMap = new Map();
      if (usersData) {
        usersData.forEach(user => {
          userMap.set(user.id, {
            id: user.id,
            name: user.username || "Unknown User",
            username: user.username || "user",
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.username || "Unknown"}&background=random`,
            subscribers: 0
          });
        });
      }
      
      // Map Supabase data to our Video type
      return videosData.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || "",
        thumbnail: video.thumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=280&fit=crop",
        videoUrl: video.video_url,
        views: video.views,
        createdAt: video.created_at,
        duration: video.duration,
        userId: video.user_id,
        user: userMap.get(video.user_id) || users.find(u => u.id === video.user_id),
        likes: video.likes,
        dislikes: video.dislikes
      }));
    }
    
    // If no results, fall back to mock data
    return [...videos]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((video) => ({
        ...video,
        user: users.find((u) => u.id === video.userId),
      }));
  } catch (error) {
    console.error("Error in getRecentVideos:", error);
    // Fall back to mock data on error
    return [...videos]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((video) => ({
        ...video,
        user: users.find((u) => u.id === video.userId),
      }));
  }
};
