export interface User {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  whatsappNumber?: string;
  socialHandles?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'project_funding';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  reference: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filter: {
    dateRange: {
      start: string | null;
      end: string | null;
    };
    status: 'all' | 'pending' | 'success' | 'failed';
    search: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  imageUrl: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}

export interface Balance {
  total: number;
  available: number;
  pending: number;
  lastUpdated: string;
}

export interface AppState {
  balance: Balance;
  featuredArticles: Article[];
  activeProjects: Project[];
  upcomingEvents: Event[];
  isLoading: boolean;
  error: string | null;
}
