export interface UserAccount {
  id: string;
  name: string;
  sageloName: string;
  email: string;
  region: string;
  avatarKey: 'mpaka' | 'nyango' | 'mwana';
  xp: number;
  streakDays: number;
  hearts: number;
  dailyGoalXp: number;
  todayXp: number;
  completedLessons: string[];
  lessonScores: Record<string, number>;
  masteredWords: string[];
  notebook: Array<{
    id: string;
    sagelo: string;
    english: string;
    evidentiality: 'ha' | 'ra' | 'si' | 'ni';
    createdAt: string;
  }>;
  followingIds: string[];
  joinedAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorSageloName: string;
  authorRegion: string;
  authorAvatarKey: 'mpaka' | 'nyango' | 'mwana';
  sageloText: string;
  englishTranslation: string;
  evidentiality: 'ha' | 'ra' | 'si' | 'ni';
  grammarTag: string;
  shantiCount: number;
  likedBy: string[];
  createdAt: string;
}
