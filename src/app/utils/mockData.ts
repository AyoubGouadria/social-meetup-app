export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  languages: string[];
  city: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: "coffee" | "walk" | "study" | "gym" | "explore" | "other";
  date: string;
  time: string;
  location: string;
  locationCoords: { lat: number; lng: number };
  distance: number;
  maxParticipants: number;
  currentParticipants: number;
  languages: string[];
  host: User;
  participants: User[];
  isJoined?: boolean;
}

export interface JoinRequest {
  id: string;
  user: User;
  eventId: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Miller",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    bio: "New to Berlin, love coffee and exploring!",
    languages: ["English", "German"],
    city: "Berlin",
  },
  {
    id: "2",
    name: "Ahmed Hassan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    bio: "Software engineer, always up for a walk",
    languages: ["Arabic", "English", "German"],
    city: "Munich",
  },
  {
    id: "3",
    name: "Elena Schmidt",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    bio: "Studying in Hamburg, looking for study buddies",
    languages: ["German", "English"],
    city: "Hamburg",
  },
  {
    id: "4",
    name: "Marco Rossi",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    bio: "Gym enthusiast and coffee lover",
    languages: ["Italian", "English", "German"],
    city: "Berlin",
  },
  {
    id: "5",
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    bio: "Healthcare worker, love meeting new people",
    languages: ["English", "Hindi", "German"],
    city: "Frankfurt",
  },
];

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Coffee at Alexanderplatz",
    description: "Let's grab a coffee and chat! I know a great café nearby with amazing pastries. Perfect for meeting new people in a relaxed atmosphere.",
    category: "coffee",
    date: "2026-02-20",
    time: "14:00",
    location: "Alexanderplatz, Berlin",
    locationCoords: { lat: 52.5219, lng: 13.4132 },
    distance: 2.3,
    maxParticipants: 4,
    currentParticipants: 2,
    languages: ["English", "German"],
    host: mockUsers[0],
    participants: [mockUsers[0], mockUsers[3]],
    isJoined: false,
  },
  {
    id: "2",
    title: "Morning Run in Tiergarten",
    description: "Early morning run through the beautiful Tiergarten park. All fitness levels welcome! We'll keep a moderate pace.",
    category: "walk",
    date: "2026-02-19",
    time: "07:30",
    location: "Tiergarten, Berlin",
    locationCoords: { lat: 52.5145, lng: 13.3501 },
    distance: 3.5,
    maxParticipants: 6,
    currentParticipants: 4,
    languages: ["English", "German", "Arabic"],
    host: mockUsers[1],
    participants: [mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]],
    isJoined: false,
  },
  {
    id: "3",
    title: "Study Session - German Language",
    description: "Group study session for German B2 exam preparation. Bring your materials and let's help each other!",
    category: "study",
    date: "2026-02-21",
    time: "16:00",
    location: "Staatsbibliothek, Berlin",
    locationCoords: { lat: 52.5076, lng: 13.3698 },
    distance: 1.8,
    maxParticipants: 5,
    currentParticipants: 3,
    languages: ["English", "German"],
    host: mockUsers[2],
    participants: [mockUsers[2], mockUsers[0], mockUsers[4]],
    isJoined: false,
  },
  {
    id: "4",
    title: "Gym Workout Session",
    description: "Looking for a workout buddy! I have a gym membership at FitX Mitte. Let's motivate each other!",
    category: "gym",
    date: "2026-02-18",
    time: "18:00",
    location: "FitX Mitte, Berlin",
    locationCoords: { lat: 52.5244, lng: 13.4105 },
    distance: 0.5,
    maxParticipants: 2,
    currentParticipants: 1,
    languages: ["English", "German", "Italian"],
    host: mockUsers[3],
    participants: [mockUsers[3]],
    isJoined: false,
  },
  {
    id: "5",
    title: "Explore Kreuzberg Street Art",
    description: "Discovering the amazing street art and murals in Kreuzberg. Great opportunity to explore and take photos!",
    category: "explore",
    date: "2026-02-22",
    time: "13:00",
    location: "Kreuzberg, Berlin",
    locationCoords: { lat: 52.4987, lng: 13.4103 },
    distance: 4.2,
    maxParticipants: 8,
    currentParticipants: 5,
    languages: ["English", "German", "Hindi"],
    host: mockUsers[4],
    participants: [mockUsers[4], mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    isJoined: false,
  },
];

export const mockJoinRequests: JoinRequest[] = [
  {
    id: "1",
    user: mockUsers[1],
    eventId: "1",
    status: "pending",
    message: "Hey! I'd love to join. I'm new to Berlin and looking to meet people!",
  },
  {
    id: "2",
    user: mockUsers[2],
    eventId: "1",
    status: "pending",
    message: "Coffee sounds great! Can we make it 15 minutes later?",
  },
  {
    id: "3",
    user: mockUsers[4],
    eventId: "1",
    status: "pending",
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    userId: "1",
    userName: "Sarah Miller",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    text: "Hey everyone! Looking forward to tomorrow 😊",
    timestamp: "2026-02-17T10:30:00",
  },
  {
    id: "2",
    userId: "2",
    userName: "Ahmed Hassan",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    text: "Me too! Should we meet at the entrance or inside?",
    timestamp: "2026-02-17T10:35:00",
  },
  {
    id: "3",
    userId: "1",
    userName: "Sarah Miller",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    text: "Let's meet at the main entrance at 2pm",
    timestamp: "2026-02-17T10:37:00",
  },
  {
    id: "4",
    userId: "4",
    userName: "Marco Rossi",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    text: "Perfect! See you all there 👍",
    timestamp: "2026-02-17T10:40:00",
  },
];
