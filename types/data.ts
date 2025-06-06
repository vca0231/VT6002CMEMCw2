export interface Task {
  id: string;
  title: string;
  description: string;
  user: string;
  createdAt: string;
  comments: any[]; // You might want to define a more specific type for comments later
  commentCount: number;
} 