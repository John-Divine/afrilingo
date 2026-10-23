import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Star,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  Zap,
  Layers,
  Compass,
} from 'lucide-react';
import {
  SKILL_BRANCHES,
  SkillBranch,
  isBranchUnlocked,
} from '../data/sageloBranchingPaths';
import {
  FRENCH_SKILL_BRANCHES,
  isFrenchBranchUnlocked,
} from '../data/frenchBranchingPaths';
import { CurriculumLesson } from '../data/sageloCurriculum';
import { playSageloPhrase } from '../utils/sageloAudio';
import { getWordPhonetic } from '../utils/sageloPhonetics';

interface BranchingSkillTreesViewProps {
  completedLessonIds: string[];
  onStartLesson: (lesson: CurriculumLesson) => void;
  onJumpToUnit?: (unitNumber: number) => void;
  activeCourse?: 'sagelo' | 'french';
}

export const BranchingSkillTreesView: React.FC<BranchingSkillTreesViewProps> = ({
  completedLessonIds,
  onStartLesson,
  onJumpToUnit,
  activeCourse = 'sagelo',
}) => {
  const isFrench = activeCourse === 'french';
  const targetBranches = isFrench ? FRENCH_SKILL_BRANCHES : SKILL_BRANCHES;
  const checkUnlocked = isFrench ? isFrenchBranchUnlocked : isBranchUnlocked;

  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'conversational' | 'business' | 'philosophy' | 'healing' | 'unlocked'
  >('all');

  const filteredBranches = targetBranches.filter((branch) => {
    const status = checkUnlocked(branch, completedLessonIds);
    if (selectedCategory === 'unlocked') {
      return status.isUnlocked;
    }
    if (selectedCategory === 'all') return true;
    return branch.category === selectedCategory;
  });

  const totalUnlockedCount = targetBranches.filter(
    (b) => checkUnlocked(b, completedLessonIds).isUnlocked
  ).length;

  return (
    <div className="space-y-8">
      {/* HERO BANNER FOR SPECIALIZED TOPIC TREES */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#0F766E] text-white p-6 sm:p-8 border-2 border-b-6 border-[#047857] shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#10B981]/25 to-[#F59E0B]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F59E0B]/20 text-[#FDE047] border border-[#F59E0B]/40 flex items-center gap-1.5 shadow-xs">
                <Compass className="w-3.5 h-3.5" />
                Branching Skill Trees
              </span>
              <span className="text-xs font-bold text-[#A7F3D0]">
                {totalUnlockedCount} of {targetBranches.length} Paths Unlocked
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-xl text-xs font-bold text-[#FEF3C7] border border-[#F59E0B]/30">
              <span>{isFrench ? '🥐 Francophone Mastery' : '🌟 Deep Masteries'}</span>
            </div>
          </div>

          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isFrench
                ? 'French Specialty Branches & Pragmatic Paths'
                : 'Branch Out Beyond the Core Path'}
            </h2>
            <p className="text-sm font-semibold text-[#D1FAE5] leading-relaxed">
              {isFrench
                ? 'Complete foundational French units to unlock practical specialization trees — from Parisian café culture and metro navigation to professional French and modern slang.'
                : 'Complete foundational units on the main path to unlock specialized skill trees — from marketplace trade & negotiation to traditional healing and deep philosophy.'}
            </p>
          </div>

          {/* VISUAL BRANCHING ROADMAP PREVIEW (TREE DIAGRAM) */}
          <div className="pt-2">
            <div className="bg-black/30 backdrop-blur-xs rounded-2xl p-4 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="space-y-1 p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-mono text-[#A7F3D0]">Root Unit 1</div>
                <div className="text-base">{isFrench ? '☕' : '🗣️'}</div>
                <div className="font-bold text-[#6EE7B7] line-clamp-1">
                  {isFrench ? 'Café & Bistro' : 'Conversational'}
                </div>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-mono text-[#A7F3D0]">Root Unit 2</div>
                <div className="text-base">{isFrench ? '🚇' : '🌿'}</div>
                <div className="font-bold text-[#5EEAD4] line-clamp-1">
                  {isFrench ? 'Paris Métro' : "Healer's Circle"}
                </div>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-mono text-[#A7F3D0]">Root Unit 3</div>
                <div className="text-base">{isFrench ? '💼' : '🪙'}</div>
                <div className="font-bold text-[#FDE047] line-clamp-1">
                  {isFrench ? 'Business French' : 'Business & Trade'}
                </div>
              </div>
              <div className="space-y-1 p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase font-mono text-[#A7F3D0]">Root Unit 5</div>
                <div className="text-base">{isFrench ? '🎭' : '🔮'}</div>
                <div className="font-bold text-[#FBBF24] line-clamp-1">
                  {isFrench ? 'Slang & Verlan' : 'Sage Reasoning'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(isFrench
          ? [
              { id: 'all', label: 'All Skill Trees', icon: '🌳' },
              { id: 'unlocked', label: `Unlocked (${totalUnlockedCount})`, icon: '✨' },
              { id: 'conversational', label: 'Café Culture', icon: '☕' },
              { id: 'business', label: 'Transit & Business', icon: '💼' },
              { id: 'philosophy', label: 'Slang & Verlan', icon: '🎭' },
            ]
          : [
              { id: 'all', label: 'All Skill Trees', icon: '🌳' },
              { id: 'unlocked', label: `Unlocked (${totalUnlockedCount})`, icon: '✨' },
              { id: 'conversational', label: 'Conversational', icon: '🗣️' },
              { id: 'business', label: 'Business & Trade', icon: '🪙' },
              { id: 'philosophy', label: 'Sage Philosophy', icon: '🔮' },
              { id: 'healing', label: 'Healing Arts', icon: '🌿' },
            ]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as typeof selectedCategory)}
            className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5 active:translate-y-0.5 border-2 cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-[#059669] border-[#047857] text-white shadow-sm'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#10B981] hover:text-[#065F46]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* BRANCH CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBranches.map((branch) => {
          const status = checkUnlocked(branch, completedLessonIds);
          const completedInBranch = branch.lessons.filter((l) =>
            completedLessonIds.includes(l.id)
          ).length;
          const isBranchMastered =
            branch.lessons.length > 0 &&
            completedInBranch === branch.lessons.length;

          return (
            <div
              key={branch.id}
              className={`rounded-3xl border-2 border-b-6 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                status.isUnlocked
                  ? 'bg-white border-[#E5E5E5] hover:border-[#CBD5E1] shadow-md'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-90'
              }`}
            >
              {/* TOP HEADER */}
              <div
                className={`p-5 sm:p-6 border-b-2 bg-gradient-to-r ${branch.bgGradient} relative overflow-hidden`}
              >
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-md border-2 border-black/5 flex items-center justify-center text-3xl shrink-0">
                      {branch.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#1F2937]/75">
                          Specialization Tree
                        </span>
                        {isBranchMastered && (
                          <span className="px-2 py-0.5 rounded-md bg-[#58CC02] text-white text-[10px] font-black uppercase tracking-wider">
                            Mastered
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-[#0F172A] leading-tight">
                        {branch.title}
                      </h3>
                    </div>
                  </div>

                  {/* UNLOCK STATUS BADGE */}
                  {status.isUnlocked ? (
                    <div className="px-3 py-1 bg-white/90 border border-black/10 rounded-xl text-xs font-black text-[#15803D] flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
                      <span>Unlocked</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-black/10 border border-black/15 rounded-xl text-xs font-black text-[#475569] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </div>
                  )}
                </div>

                <p className="text-xs font-bold text-[#334155] mt-3 relative z-10 leading-relaxed">
                  {branch.tagline}
                </p>
              </div>

              {/* CARD BODY */}
              <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                {/* IF UNLOCKED: DISPLAY INTERACTIVE BRANCH LESSONS */}
                {status.isUnlocked ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#AFAFAF]">
                      <span>Branch Lessons:</span>
                      <span className="text-[#58CC02]">
                        {completedInBranch}/{branch.lessons.length} Completed
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {branch.lessons.map((bLesson, idx) => {
                        const isLessonDone = completedLessonIds.includes(bLesson.id);
                        return (
                          <div
                            key={bLesson.id}
                            className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                              isLessonDone
                                ? 'bg-[#F0FDF4] border-[#86EFAC]'
                                : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#94A3B8]'
                            }`}
                          >
                            <div className="space-y-0.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-black text-[#0284C7] bg-[#E0F2FE] px-1.5 py-0.2 rounded border border-[#BAE6FD]">
                                  {bLesson.numberLabel}
                                </span>
                                <h4 className="text-sm font-black text-[#1E293B] line-clamp-1">
                                  {bLesson.title}
                                </h4>
                              </div>
                              <p className="text-xs font-semibold text-[#64748B] line-clamp-1">
                                {bLesson.subtitle}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onStartLesson(bLesson)}
                              className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 active:translate-y-0.5 cursor-pointer shadow-xs ${
                                isLessonDone
                                  ? 'bg-[#059669] hover:bg-[#047857] text-white border-b-2 border-[#065F46]'
                                  : 'bg-[#0D9488] hover:bg-[#0F766E] text-white border-b-2 border-[#115E59]'
                              }`}
                            >
                              <span>{isLessonDone ? 'Review' : 'Start'}</span>
                              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* IF LOCKED: CLEAR REQUIREMENT PROGRESS BAR & JUMP ACTION */
                  <div className="space-y-4 my-auto py-2">
                    <div className="p-4 rounded-2xl bg-white border-2 border-[#E2E8F0] space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-center shrink-0 text-[#64748B]">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#94A3B8] block">
                            Unlock Requirement:
                          </span>
                          <p className="text-xs font-bold text-[#1E293B]">
                            {branch.unlockRequirement.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="text-[#64748B]">Prerequisite Progress</span>
                          <span className="text-[#059669]">
                            {status.completedCount} / {status.requiredCount} Lessons
                          </span>
                        </div>
                        <div className="h-3 bg-[#E2E8F0] rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-[#059669] via-[#0D9488] to-[#F59E0B] rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(8, status.progressPercent)}%` }}
                          />
                        </div>
                      </div>

                      {onJumpToUnit && (
                        <button
                          type="button"
                          onClick={() => onJumpToUnit(branch.unlockRequirement.unitNumber)}
                          className="w-full py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#ECFDF5] border border-[#CBD5E1] hover:border-[#10B981] text-[#065F46] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:translate-y-0.5 cursor-pointer"
                        >
                          <span>Jump to {branch.unlockRequirement.unitName.split(':')[0]}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* BOTTOM VOCABULARY PILLS */}
                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="text-[11px] font-black uppercase text-[#94A3B8]">
                    Specialized Roots:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {branch.lessons.flatMap((l) => l.wordsIntroduced).slice(0, 5).map((w, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] font-mono text-[10px] font-bold text-[#475569]"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
