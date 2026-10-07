import React, { useState } from 'react';
import {
  Users,
  Send,
  Volume2,
  UserPlus,
  UserCheck,
  Heart,
  BookOpen,
  UserCircle2,
  Trophy,
} from 'lucide-react';
import type { UserAccount, CommunityPost } from '../types';
import { CharacterAvatar } from './AfricanArtwork';
import { playSageloPhrase } from '../utils/sageloAudio';

interface CommunityCircleViewProps {
  currentUser: UserAccount;
  leaderboard: UserAccount[];
  posts: CommunityPost[];
  onCreatePost: (payload: {
    sageloText: string;
    englishTranslation: string;
    evidentiality: 'ha' | 'ra' | 'si' | 'ni';
    grammarTag: string;
  }) => void;
  onToggleShanti: (postId: string) => void;
  onToggleFollow: (targetUserId: string) => void;
  onSwitchOrUpdateAccount: (payload: {
    name: string;
    email: string;
    region: string;
    avatarKey: 'mpaka' | 'nyango' | 'mwana';
    sageloName: string;
  }) => void;
  onAddNotebookEntry: (
    sagelo: string,
    english: string,
    evidentiality: 'ha' | 'ra' | 'si' | 'ni'
  ) => void;
}

export const CommunityCircleView: React.FC<CommunityCircleViewProps> = ({
  currentUser,
  leaderboard,
  posts,
  onCreatePost,
  onToggleShanti,
  onToggleFollow,
  onSwitchOrUpdateAccount,
  onAddNotebookEntry,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'account'>('feed');

  const [sageloText, setSageloText] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [evidentiality, setEvidentiality] = useState<'ha' | 'ra' | 'si' | 'ni'>('ha');
  const [grammarTag, setGrammarTag] = useState('Lesson 24 · Evidentiality Practice');

  const [noteSagelo, setNoteSagelo] = useState('');
  const [noteEnglish, setNoteEnglish] = useState('');

  const [accName, setAccName] = useState(currentUser.name);
  const [accSageloName, setAccSageloName] = useState(currentUser.sageloName);
  const [accEmail, setAccEmail] = useState(currentUser.email);
  const [accRegion, setAccRegion] = useState(currentUser.region);
  const [accAvatar, setAccAvatar] = useState<'mpaka' | 'nyango' | 'mwana'>(
    currentUser.avatarKey
  );
  const [accountSavedMsg, setAccountSavedMsg] = useState(false);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sageloText.trim() || !englishTranslation.trim()) return;
    onCreatePost({
      sageloText,
      englishTranslation,
      evidentiality,
      grammarTag,
    });
    setSageloText('');
    setEnglishTranslation('');
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteSagelo.trim() || !noteEnglish.trim()) return;
    onAddNotebookEntry(noteSagelo, noteEnglish, 'ha');
    setNoteSagelo('');
    setNoteEnglish('');
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim() || !accEmail.trim()) return;
    onSwitchOrUpdateAccount({
      name: accName,
      sageloName: accSageloName,
      email: accEmail,
      region: accRegion,
      avatarKey: accAvatar,
    });
    setAccountSavedMsg(true);
    setTimeout(() => setAccountSavedMsg(false), 2500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6DFD3] pb-6">
        <div className="space-y-1">
          <div className="text-xs text-[#5C4D43]">
            Part IV Chapter D · Pan-African Learners, Leaderboard & Cloud Account Sync
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#1C1613]">
            The Circle of Sages (Ndeko hu wa Sasagu)
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#F3EFE6] border border-[#E6DFD3] rounded-xl">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'feed'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Circle Feed & Practice</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Pan-African Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-[#C84B24] text-white'
                : 'text-[#5C4D43] hover:text-[#1C1613]'
            }`}
          >
            <UserCircle2 className="w-3.5 h-3.5" />
            <span>Account & Sagelo Notebook</span>
          </button>
        </div>
      </div>

      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <form
              onSubmit={handlePostSubmit}
              className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-[#1C1613]">
                  Share a Sentence with the Circle (+15 XP)
                </h3>
                <span className="text-xs text-[#5C4D43]">
                  Posting as {currentUser.sageloName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1613]">
                    Your Sagelo Sentence
                  </label>
                  <input
                    type="text"
                    value={sageloText}
                    onChange={e => setSageloText(e.target.value)}
                    placeholder="e.g. Shanti, ndeko hu! Yo sago lerni ha."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] text-sm text-[#1C1613] focus:outline-none focus:border-[#C84B24]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1613]">
                    English Meaning
                  </label>
                  <input
                    type="text"
                    value={englishTranslation}
                    onChange={e => setEnglishTranslation(e.target.value)}
                    placeholder="e.g. Peace, friends! I am learning wisdom firsthand."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] text-sm text-[#1C1613] focus:outline-none focus:border-[#C84B24]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#5C4D43]">
                    Evidentiality Tag (Lesson 24):
                  </span>
                  {(['ha', 'ra', 'si', 'ni'] as const).map(ev => (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => setEvidentiality(ev)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono-num font-semibold border ${
                        evidentiality === ev
                          ? 'bg-[#1B6B4A] text-white border-[#1B6B4A]'
                          : 'bg-[#FBF9F5] text-[#5C4D43] border-[#E6DFD3]'
                      }`}
                    >
                      ...{ev}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C84B24] hover:bg-[#8F2D10] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Circle</span>
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {posts.map(post => {
                const isLiked = post.likedBy.includes(currentUser.id);
                return (
                  <div
                    key={post.id}
                    className="bg-white border border-[#E6DFD3] rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CharacterAvatar
                          character={post.authorAvatarKey}
                          size="md"
                        />
                        <div>
                          <div className="text-sm font-semibold text-[#1C1613]">
                            {post.authorName} ·{' '}
                            <span className="text-[#C84B24]">
                              {post.authorSageloName}
                            </span>
                          </div>
                          <div className="text-xs text-[#5C4D43] flex items-center gap-1.5">
                            <span>{post.authorRegion}</span>
                            <span aria-hidden="true">·</span>
                            <span>{post.createdAt}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num text-[#1B6B4A] font-semibold">
                              Evidentiality: ...{post.evidentiality}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => playSageloPhrase(post.sageloText)}
                        className="p-2 rounded-lg bg-[#F3EFE6] hover:bg-[#C84B24] text-[#1C1613] hover:text-white transition-colors shrink-0"
                        aria-label="Listen to post"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] space-y-1">
                      <p className="text-lg font-display font-semibold text-[#1C1613]">
                        “{post.sageloText}”
                      </p>
                      <p className="text-sm text-[#5C4D43]">
                        {post.englishTranslation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#5C4D43] pt-1">
                      <span>{post.grammarTag}</span>
                      <button
                        onClick={() => onToggleShanti(post.id)}
                        className={`px-3 py-1.5 rounded-lg border inline-flex items-center gap-1.5 font-semibold transition-colors whitespace-nowrap ${
                          isLiked
                            ? 'bg-[#C84B24]/10 border-[#C84B24] text-[#C84B24]'
                            : 'bg-white border-[#E6DFD3] text-[#5C4D43] hover:text-[#1C1613]'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span className="font-mono-num">
                          Shanti ({post.shantiCount})
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F3EFE6] border border-[#E6DFD3] rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-lg font-display font-semibold text-[#1C1613]">
                Connect with Fellow Sages
              </h3>
              <p className="text-xs text-[#5C4D43]">
                Build your Pan-African study circle and practice daily dialogues together.
              </p>
            </div>

            <div className="space-y-3">
              {leaderboard
                .filter(u => u.id !== currentUser.id)
                .map(learner => {
                  const isFollowing = currentUser.followingIds.includes(
                    learner.id
                  );
                  return (
                    <div
                      key={learner.id}
                      className="p-3.5 rounded-xl bg-white border border-[#E6DFD3] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CharacterAvatar
                          character={learner.avatarKey}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1C1613] truncate">
                            {learner.name}
                          </div>
                          <div className="text-xs text-[#5C4D43] truncate">
                            {learner.region} ·{' '}
                            <span className="font-mono-num text-[#C84B24] font-semibold">
                              {learner.xp} XP
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleFollow(learner.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap ${
                          isFollowing
                            ? 'bg-[#1B6B4A]/15 text-[#1B6B4A] border border-[#1B6B4A]'
                            : 'bg-[#1C1613] text-white hover:bg-[#C84B24]'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Connected</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Connect</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white border border-[#E6DFD3] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#E6DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F3EFE6]/50">
            <div>
              <h3 className="text-xl font-display font-semibold text-[#1C1613]">
                Sasagu Circle Standings
              </h3>
              <p className="text-xs text-[#5C4D43]">
                Ranked by Wisdom XP across lessons, stories, and honest evidentiality practice.
              </p>
            </div>
            <div className="text-xs font-mono-num text-[#1B6B4A] font-semibold">
              ● YOUR RANK: #{leaderboard.findIndex(u => u.id === currentUser.id) + 1} OF {leaderboard.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E6DFD3] text-xs text-[#5C4D43] bg-[#FBF9F5]">
                  <th className="py-3 px-6 font-semibold">Rank</th>
                  <th className="py-3 px-6 font-semibold">Learner (Misaga)</th>
                  <th className="py-3 px-6 font-semibold">Region</th>
                  <th className="py-3 px-6 font-semibold">Lessons Done</th>
                  <th className="py-3 px-6 font-semibold">Streak</th>
                  <th className="py-3 px-6 font-semibold text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD3]">
                {leaderboard.map((u, idx) => {
                  const isMe = u.id === currentUser.id;
                  return (
                    <tr
                      key={u.id}
                      className={isMe ? 'bg-[#C84B24]/10 font-semibold' : 'hover:bg-[#FBF9F5]'}
                    >
                      <td className="py-3.5 px-6 font-mono-num text-[#C84B24] font-semibold">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <CharacterAvatar character={u.avatarKey} size="sm" />
                          <div>
                            <div className="text-[#1C1613]">
                              {u.name} {isMe && '(You)'}
                            </div>
                            <div className="text-xs text-[#5C4D43]">
                              {u.sageloName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-[#5C4D43]">
                        {u.region}
                      </td>
                      <td className="py-3.5 px-6 font-mono-num text-[#1C1613]">
                        {u.completedLessons.length} / 35
                      </td>
                      <td className="py-3.5 px-6 font-mono-num text-[#1B6B4A]">
                        {u.streakDays} tawinya
                      </td>
                      <td className="py-3.5 px-6 font-mono-num text-right font-semibold text-[#1C1613]">
                        {u.xp} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleAccountSubmit}
            className="lg:col-span-5 bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-[#E6DFD3]">
              <CharacterAvatar character={accAvatar} size="lg" />
              <div>
                <h3 className="text-lg font-display font-semibold text-[#1C1613]">
                  Your Learner Account
                </h3>
                <p className="text-xs text-[#5C4D43]">
                  Update your profile or enter a new email to create a fresh account.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1613] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] text-sm text-[#1C1613]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1613] mb-1">
                  Sagelo Title (Misaga / Mpaka Name)
                </label>
                <input
                  type="text"
                  value={accSageloName}
                  onChange={e => setAccSageloName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] text-sm text-[#1C1613]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1613] mb-1">
                  Email (Used to sync your progress online)
                </label>
                <input
                  type="email"
                  value={accEmail}
                  onChange={e => setAccEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] text-sm text-[#1C1613]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1613] mb-1">
                  City / Country
                </label>
                <input
                  type="text"
                  value={accRegion}
                  onChange={e => setAccRegion(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] text-sm text-[#1C1613]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1613] mb-1.5">
                  Choose Your Guide Avatar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mwana', 'nyango', 'mpaka'] as const).map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAccAvatar(av)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium ${
                        accAvatar === av
                          ? 'bg-[#C84B24]/10 border-[#C84B24] text-[#C84B24]'
                          : 'bg-[#FBF9F5] border-[#E6DFD3] text-[#5C4D43]'
                      }`}
                    >
                      <CharacterAvatar character={av} size="sm" />
                      <span className="capitalize">{av}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#C84B24] hover:bg-[#8F2D10] text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              {accountSavedMsg
                ? '✓ Account Synced & Saved!'
                : 'Save / Switch Account'}
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-4">
              <div>
                <div className="text-xs text-[#C84B24] font-semibold">
                  Appendix 4 Study Roadmap · Personal Journal
                </div>
                <h3 className="text-xl font-display font-semibold text-[#1C1613]">
                  My Sagelo Notebook ({currentUser.notebook.length} Entries)
                </h3>
              </div>
              <BookOpen className="w-5 h-5 text-[#C84B24]" />
            </div>

            <form onSubmit={handleNoteSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={noteSagelo}
                  onChange={e => setNoteSagelo(e.target.value)}
                  placeholder="Write an original Sagelo sentence..."
                  className="px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] text-sm text-[#1C1613]"
                />
                <input
                  type="text"
                  value={noteEnglish}
                  onChange={e => setNoteEnglish(e.target.value)}
                  placeholder="English translation..."
                  className="px-3.5 py-2.5 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] text-sm text-[#1C1613]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#1B6B4A] hover:bg-[#0F4C32] text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                + Record in Notebook (+10 XP)
              </button>
            </form>

            <div className="space-y-3">
              {currentUser.notebook.map(entry => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl bg-[#FBF9F5] border border-[#E6DFD3] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-base font-display font-semibold text-[#1C1613]">
                      {entry.sagelo}
                    </div>
                    <div className="text-sm text-[#5C4D43]">{entry.english}</div>
                  </div>
                  <button
                    onClick={() => playSageloPhrase(entry.sagelo)}
                    className="p-2 rounded-lg bg-[#F3EFE6] hover:bg-[#C84B24] text-[#1C1613] hover:text-white transition-colors shrink-0"
                    aria-label="Listen to notebook entry"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
