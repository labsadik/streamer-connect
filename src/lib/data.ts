import { User, Video, Comment } from "@/types";

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

// Mock Videos with animation-themed content
export const videos: Video[] = [
  {
    id: "1",
    title: "Big Buck Bunny: Animated Short Film",
    description: "Enjoy this delightful animated short film featuring Big Buck Bunny, a gentle giant rabbit who encounters three rodents. A perfect example of open-source animation creativity.",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=280&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    views: 1250000,
    createdAt: "2023-08-12T15:30:00Z",
    duration: 596, // 9:56 - actual video length
    userId: "3",
    likes: 45600,
    dislikes: 1200,
  },
  {
    id: "2",
    title: "For Bigger Blazes: Fire Safety Animation",
    description: "An educational animated short about fire safety and prevention. Learn important safety tips through engaging animation that makes learning about fire safety fun and memorable.",
    thumbnail: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500&h=280&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    views: 876000,
    createdAt: "2023-09-05T08:45:00Z",
    duration: 15, // 0:15 - actual video length
    userId: "4",
    likes: 32400,
    dislikes: 800,
  },
  {
    id: "4",
    title: "For Bigger Fun: Entertainment Animation",
    description: "Experience the joy and excitement in this vibrant animation about having fun. A colorful and energetic short that celebrates the spirit of entertainment and enjoyment.",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=280&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    views: 2100000,
    createdAt: "2023-10-01T10:30:00Z",
    duration: 60, // 1:00 - actual video length
    userId: "3",
    likes: 78500,
    dislikes: 3200,
  },
  {
    id: "7",
    title: "Sintel: Epic Fantasy Animation",
    description: "Embark on an epic fantasy journey with Sintel, a young woman searching for her dragon companion. A beautifully crafted animated short film with stunning visuals and emotional storytelling.",
    thumbnail: "https://tse2.mm.bing.net/th/id/OIP.tg_zWp2y9itG670A5geIdgHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    views: 823000,
    createdAt: "2023-08-10T09:15:00Z",
    duration: 888, // 14:48 - actual video length
    userId: "4",
    likes: 38700,
    dislikes: 1100,
  },
  {
    id: "8",
    title: "Tears of Steel: Sci-Fi Animation",
    description: "Dive into this science fiction animation masterpiece featuring stunning visual effects and a compelling story about love, loss, and technology. A groundbreaking blend of live-action and animation.",
    thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=280&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    views: 612000,
    createdAt: "2023-09-25T11:50:00Z",
    duration: 734, // 12:14 - actual video length
    userId: "5",
    likes: 29800,
    dislikes: 750,
  },
  {
    id: "9",
    title: "We Are Going On Bullrun: Racing Animation",
    description: "Experience the thrill of racing in this action-packed animated short. Join the adventure as characters compete in an exciting bullrun race with stunning animated sequences.",
    thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=280&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    views: 1500000,
    createdAt: "2023-10-05T14:30:00Z",
    duration: 64, // 1:04 - actual video length
    userId: "3",
    likes: 89000,
    dislikes: 2100,
  },
  {
    id: "10",
    title: "What Car Can You Get For A Grand: Budget Car Animation",
    description: "Discover what kind of car you can buy with just $1000 in this informative and entertaining animated guide. Learn about budget car options through creative animation and helpful insights.",
    thumbnail: "https://i.ytimg.com/vi/QTwduYuXCJU/maxresdefault.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    views: 980000,
    createdAt: "2023-09-15T10:15:00Z",
    duration: 71, // 1:11 - actual video length
    userId: "2",
    likes: 56700,
    dislikes: 1300,
  },
];

// Mock Comments
export const comments: Comment[] = [
  {
    id: "1",
    content: "Big Buck Bunny is such a classic! The animation quality is amazing for an open-source project. The attention to detail in every frame is incredible.",
    userId: "2",
    videoId: "1",
    createdAt: "2023-08-13T10:20:00Z",
  },
  {
    id: "2",
    content: "The fire safety animation was surprisingly effective! My kids actually paid attention and learned important safety tips. Great way to educate!",
    userId: "4",
    videoId: "2",
    createdAt: "2023-09-06T15:40:00Z",
  },
  {
    id: "3",
    content: "For Bigger Escapes had such creative animation sequences! The way they portrayed the escape scenarios was both thrilling and beautifully animated.",
    userId: "1",
    videoId: "3",
    createdAt: "2023-07-29T18:25:00Z",
  },
  {
    id: "4",
    content: "The For Bigger Fun animation really lives up to its name! The colors and energy in this short are contagious. Made me smile the whole time.",
    userId: "5",
    videoId: "4",
    createdAt: "2023-10-02T11:15:00Z",
  },
  {
    id: "5",
    content: "Love the car animation in Joyrides! The way they animated the driving sequences feels so dynamic and exciting. Great work!",
    userId: "3",
    videoId: "5",
    createdAt: "2023-08-26T09:30:00Z",
  },
  {
    id: "6",
    content: "The meltdowns animation is hilarious! So relatable and the comedic timing is perfect. Everyone should watch this when having a bad day.",
    userId: "4",
    videoId: "6",
    createdAt: "2023-09-19T16:20:00Z",
  },
  {
    id: "7",
    content: "Sintel is absolutely breathtaking! The fantasy world they created is so immersive. The emotional story combined with stunning animation makes this a masterpiece.",
    userId: "1",
    videoId: "7",
    createdAt: "2023-08-11T12:45:00Z",
  },
  {
    id: "8",
    content: "Tears of Steel blew me away! The blend of live-action and animation is seamless. The sci-fi elements are so well executed. This is professional-level work!",
    userId: "2",
    videoId: "8",
    createdAt: "2023-09-26T14:10:00Z",
  },
  {
    id: "9",
    content: "The bullrun racing animation is so exciting! The way they captured the speed and intensity of racing through animation is impressive. Love the energy!",
    userId: "5",
    videoId: "9",
    createdAt: "2023-10-06T09:15:00Z",
  },
  {
    id: "10",
    content: "Great budget car guide! The animation made learning about affordable cars actually fun. The information was practical and well-presented.",
    userId: "3",
    videoId: "10",
    createdAt: "2023-09-16T11:30:00Z",
  },
];

// Helper functions to retrieve and manipulate data
export const getVideoWithUser = async (videoId: string): Promise<Video | undefined> => {
  const video = videos.find((v) => v.id === videoId);
  if (!video) return undefined;
  
  return { 
    ...video, 
    user: users.find((u) => u.id === video.userId) 
  };
};

export const getVideosByUser = async (userId: string): Promise<Video[]> => {
  return videos
    .filter((video) => video.userId === userId)
    .map((video) => ({
      ...video,
      user: users.find((u) => u.id === video.userId),
    }));
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
  return users.find((user) => user.id === userId);
};

export const getAllVideos = async (): Promise<Video[]> => {
  return videos.map((video) => ({
    ...video,
    user: users.find((u) => u.id === video.userId),
  }));
};

export const getTrendingVideos = async (): Promise<Video[]> => {
  return [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4)
    .map((video) => ({
      ...video,
      user: users.find((u) => u.id === video.userId),
    }));
};

export const getRecentVideos = async (): Promise<Video[]> => {
  return [...videos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((video) => ({
      ...video,
      user: users.find((u) => u.id === video.userId),
    }));
};