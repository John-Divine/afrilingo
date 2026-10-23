import React from 'react';
import {
  Check,
  CheckCircle2,
  Sparkles,
  Trophy,
  ArrowRight,
  Globe,
  BookOpen,
  Award,
  Layers,
  X,
  Star,
} from 'lucide-react';
import { ALL_LESSONS } from '../data/sageloCurriculum';
import { ALL_FRENCH_LESSONS } from '../data/frenchCurriculum';

export interface LanguageCourseOption {
  id: 'sagelo' | 'french';
  name: string;
  nativeName: string;
  flag: string;
  tagline: string;
  description: string;
  accentColor: string;
  themeGradient: string;
  borderTheme: string;
  badgeBg: string;
  badgeText: string;
  stats: {
    units: number;
    lessons: number;
    branches: number;
    cultureNote: string;
  };
}

export const LANGUAGE_COURSES: LanguageCourseOption[] = [
  {
    id: 'sagelo',
    name: 'Sagelo',
    nativeName: 'Lulimi lwa Basaga',
    flag: '🌍',
    tagline: 'Pan-African Auxiliary Language of Sages',
    description:
      'Engineered from Lonkundo, Lingala, Swahili, and Bantu roots with elegant 5-vowel endings, strict evidentiality particles, and harmonic sound rules.',
    accentColor: '#059669', // Emerald
    themeGradient: 'from-[#059669]/10 via-[#0D9488]/5 to-white',
    borderTheme: 'border-[#059669]',
    badgeBg: 'bg-[#059669]/10',
    badgeText: 'text-[#059669]',
    stats: {
      units: 8,
      lessons: ALL_LESSONS.length,
      branches: 4,
      cultureNote: 'Origins in the Congo Basin & Central African linguistic harmony',
    },
  },
  {
    id: 'french',
    name: 'Français (French)',
    nativeName: 'Langue de Molière',
    flag: '🇫🇷',
    tagline: 'Travel, Gastronomy, Culture & Fluency',
    description:
      'Master café conversations, Paris métro navigation, professional corporate etiquette, and everyday Parisian slang like verlan and argot.',
    accentColor: '#0D9488', // Jade
    themeGradient: 'from-[#0D9488]/10 via-[#059669]/5 to-white',
    borderTheme: 'border-[#0D9488]',
    badgeBg: 'bg-[#0D9488]/10',
    badgeText: 'text-[#0D9488]',
    stats: {
      units: 7,
      lessons: ALL_FRENCH_LESSONS.length,
      branches: 4,
      cultureNote: 'Spoken across 29 countries in Africa, Europe & the Francophonie',
    },
  },
];

export const UPCOMING_COURSES = [
  {
    id: 'swahili',
    name: 'Kiswahili (Swahili)',
    flag: '🦁',
    region: 'East Africa',
    speakers: '100M+ Speakers',
    note: 'Official tongue of the African Union & East African Community',
    status: 'In Linguistic Review',
  },
  {
    id: 'yoruba',
    name: 'Yorùbá',
    flag: '👑',
    region: 'West Africa',
    speakers: '45M+ Speakers',
    note: 'Famous tonal richness, proverbs, and Ifá wisdom traditions',
    status: 'In Linguistic Review',
  },
];

interface LanguageChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCourse: 'sagelo' | 'french';
  onSelectCourse: (courseId: 'sagelo' | 'french') => void;
  completedLessons: string[];
  userXp: number;
}

export const LanguageChoiceModal: React.FC<LanguageChoiceModalProps> = ({
  isOpen,
  onClose,
  activeCourse,
  onSelectCourse,
  completedLessons,
  userXp,
}) => {
  if (!isOpen) return null;

  const sageloDone = completedLessons.filter((id) => !id.startsWith('fr-')).length;
  const frenchDone = completedLessons.filter((id) => id.startsWith('fr-')).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#1E130D] border-2 border-b-6 border-[#3D2619] rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto font-['Nunito',sans-serif] text-[#FEF3C7]">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 pb-4 border-[#3D2619]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#059669] via-[#0D9488] to-[#D97706] text-white flex items-center justify-center text-2xl shadow-md shrink-0">
              🌍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#10B981]">
                  Multi-Language Courses
                </span>
                <span className="text-[10px] bg-[#2A1C14] text-[#F59E0B] font-black px-2 py-0.5 rounded-full border border-[#D97706]/40">
                  Emerald & Gold
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#FEF3C7]">
                Choose Language to Learn
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#2A1C14] hover:bg-[#3D2619] text-[#D4A373] hover:text-[#FEF3C7] flex items-center justify-center text-lg font-black transition-colors cursor-pointer border border-[#3D2619]"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-bold text-[#D4A373] leading-relaxed">
          Switch between languages anytime! Your streak, cowrie gems, and XP remain unified across your entire learning journey.
        </p>

        {/* Available Active Language Cards */}
        <div className="space-y-4">
          <div className="text-xs font-black uppercase tracking-wider text-[#F59E0B] px-1">
            Available Courses
          </div>

          <div className="grid grid-cols-1 gap-4">
            {LANGUAGE_COURSES.map((course) => {
              const isActive = activeCourse === course.id;
              const completedCount = course.id === 'sagelo' ? sageloDone : frenchDone;
              const totalLessons = course.stats.lessons;
              const progressPct = Math.round((completedCount / (totalLessons || 1)) * 100);

              return (
                <div
                  key={course.id}
                  onClick={() => {
                    onSelectCourse(course.id);
                    onClose();
                  }}
                  className={`p-5 rounded-2xl border-2 border-b-6 transition-all cursor-pointer relative overflow-hidden group ${
                    isActive
                      ? 'bg-gradient-to-br from-[#064E3B]/40 via-[#241710] to-[#042F2E]/40 border-[#059669] ring-4 ring-[#059669]/25 shadow-md'
                      : 'bg-[#241710] hover:bg-[#2C1D14] border-[#3D2619] hover:border-[#0D9488]'
                  }`}
                >
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-[#1C120B] border-2 border-[#3D2619] shadow-sm flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform">
                        {course.flag}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-[#FEF3C7]">
                            {course.name}
                          </h3>
                          <span className="text-xs font-bold text-[#D4A373] italic">
                            ({course.nativeName})
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-[#059669] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Active Course</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#14B8A6] mt-0.5">
                          {course.tagline}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course.id);
                        onClose();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? 'bg-[#059669] border-b-2 border-[#047857] text-[#FEF3C7] shadow-xs'
                          : 'bg-[#2C1D14] hover:bg-[#059669] text-[#FEF3C7] border border-[#442918] hover:border-[#047857]'
                      }`}
                    >
                      <span>{isActive ? 'Current' : 'Select'}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>

                  <p className="text-xs font-medium text-[#D4A373] mt-3 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Progress & Stat Strip */}
                  <div className="mt-4 pt-3 border-t border-[#3D2619] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-[#FEF3C7] font-bold">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>{course.stats.units} Units</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{course.stats.lessons} Lessons</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#14B8A6]" />
                        <span>{course.stats.branches} Skill Tracks</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 min-w-[140px]">
                      <div className="flex-1 h-2.5 bg-[#1C120B] rounded-full overflow-hidden border border-[#3D2619]">
                        <div
                          className="h-full bg-gradient-to-r from-[#059669] via-[#0D9488] to-[#F59E0B] rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-black text-[#FEF3C7]">
                        {completedCount}/{totalLessons} ({progressPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Languages */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-black uppercase tracking-wider text-[#F59E0B] px-1 flex items-center justify-between">
            <span>Upcoming Additions</span>
            <span className="text-[10px] text-[#F59E0B] font-black">Community Request</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UPCOMING_COURSES.map((upcoming) => (
              <div
                key={upcoming.id}
                className="p-3.5 bg-[#241710] border-2 border-[#3D2619] rounded-2xl space-y-1.5 opacity-90"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{upcoming.flag}</span>
                    <span className="font-black text-sm text-[#FEF3C7]">
                      {upcoming.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1C120B] text-[#F59E0B] border border-[#D97706]/40">
                    {upcoming.status}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#D4A373]">
                  {upcoming.note}
                </p>
                <div className="text-[10px] text-[#A77C57] font-bold">
                  {upcoming.region} • {upcoming.speakers}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Close Action */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#059669] hover:bg-[#10B981] border-b-4 border-[#047857] text-[#FEF3C7] text-xs font-black uppercase tracking-wider rounded-2xl active:translate-y-1 transition-all cursor-pointer shadow-sm"
          >
            Close & Keep Learning
          </button>
        </div>
      </div>
    </div>
  );
};
