import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';

// Store & Components
import { useDiscussionStore, type DiscussionItem } from '../../discussions/store/discussion.store';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';
import { DiscussionsSectionTabs } from '../../discussions/components/DiscussionsSectionTabs';
import { FeatureDisabledBanner } from '../../discussions/components/FeatureDisabledBanner';
import { DiscussionHomeHeader } from '../../discussions/components/DiscussionHomeHeader';
import { DiscussionSummaryCards } from '../../discussions/components/DiscussionSummaryCards';
import { DiscussionFilters } from '../../discussions/components/DiscussionFilters';
import { DiscussionListCard } from '../../discussions/components/DiscussionListCard';
import { DiscussionThreadView } from '../../discussions/components/DiscussionThreadView';
import { CourseMembersSidebar } from '../../discussions/components/CourseMembersSidebar';
import { PersonalChatView } from '../../discussions/components/PersonalChatView';

import { CreateDiscussionModal } from '../../discussions/components/CreateDiscussionModal';
import { ModerationQueueModal } from '../../discussions/components/ModerationQueueModal';
import { DiscussionAnalyticsModal } from '../../discussions/components/DiscussionAnalyticsModal';
import { ExportDiscussionsModal } from '../../discussions/components/ExportDiscussionsModal';
import { DiscussionSettingsModal } from '../../discussions/components/DiscussionSettingsModal';

export const CourseDiscussionsPage: React.FC = () => {
  const params = useParams<{ courseUuid?: string; '*': string }>();
  const navigate = useNavigate();

  const courseUuid = params.courseUuid || '550e8400-e29b-41d4-a716-446655440000';

  // Subpath parsing for routing
  const subPath = (params['*'] || '').replace(/^\/+/, '');
  const pathSegments = subPath.split('/').filter(Boolean);

  // Section determination: 'community' vs 'personal'
  const isPersonalSection = pathSegments[0] === 'personal';
  const activeSection: 'community' | 'personal' = isPersonalSection ? 'personal' : 'community';

  // Specific UUID targets
  const targetUuid = pathSegments[1] || null;
  const activeDiscussionUuid = !isPersonalSection ? targetUuid : null;
  const activeStudentUuid = isPersonalSection ? targetUuid : null;

  // Course Feature Flags
  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const courseFeatures = getCourseFeatures ? getCourseFeatures(courseUuid) : (useCourseFeaturesStore.getState().featuresByCourse[courseUuid] || DEFAULT_COURSE_FEATURES);

  // Discussion Store State
  const discussions = useDiscussionStore((state) => state.discussions);
  const replies = useDiscussionStore((state) => state.replies);
  const reports = useDiscussionStore((state) => state.reports);

  const addDiscussion = useDiscussionStore((state) => state.addDiscussion);
  const updateDiscussion = useDiscussionStore((state) => state.updateDiscussion);
  const deleteDiscussion = useDiscussionStore((state) => state.deleteDiscussion);
  const togglePinDiscussion = useDiscussionStore((state) => state.togglePinDiscussion);
  const toggleLockDiscussion = useDiscussionStore((state) => state.toggleLockDiscussion);
  const toggleArchiveDiscussion = useDiscussionStore((state) => state.toggleArchiveDiscussion);
  const toggleResolveDiscussion = useDiscussionStore((state) => state.toggleResolveDiscussion);
  const incrementViews = useDiscussionStore((state) => state.incrementViews);
  const toggleLikeDiscussion = useDiscussionStore((state) => state.toggleLikeDiscussion);
  const addReply = useDiscussionStore((state) => state.addReply);
  const toggleLikeReply = useDiscussionStore((state) => state.toggleLikeReply);
  const togglePinReply = useDiscussionStore((state) => state.togglePinReply);
  const toggleReplyReaction = useDiscussionStore((state) => state.toggleReplyReaction);
  const markOfficialAnswer = useDiscussionStore((state) => state.markOfficialAnswer);
  const deleteReply = useDiscussionStore((state) => state.deleteReply);

  const reportItem = useDiscussionStore((state) => state.reportItem);
  const handleReportAction = useDiscussionStore((state) => state.handleReportAction);

  const getCourseSettings = useDiscussionStore((state) => state.getCourseSettings);
  const updateCourseSettings = useDiscussionStore((state) => state.updateCourseSettings);
  const getCourseMembers = useDiscussionStore((state) => state.getCourseMembers);

  const sendPersonalMessage = useDiscussionStore((state) => state.sendPersonalMessage);
  const markChatAsSeen = useDiscussionStore((state) => state.markChatAsSeen);
  const getCoursePersonalChats = useDiscussionStore((state) => state.getCoursePersonalChats);

  const courseSettings = getCourseSettings(courseUuid);
  const courseMembers = getCourseMembers(courseUuid);
  const personalChats = getCoursePersonalChats(courseUuid);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [createdByFilter, setCreatedByFilter] = useState('all');

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<DiscussionItem | null>(null);

  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filtered discussions list
  const filteredDiscussions = useMemo(() => {
    let list = discussions.filter((d) => d.courseUuid === courseUuid);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q) ||
          d.author.name.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      list = list.filter((d) => d.category === selectedCategory);
    }

    if (createdByFilter !== 'all') {
      list = list.filter((d) => d.author.role === createdByFilter);
    }

    if (statusFilter === 'open') {
      list = list.filter((d) => !d.isResolved && !d.isArchived);
    } else if (statusFilter === 'resolved') {
      list = list.filter((d) => d.isResolved);
    } else if (statusFilter === 'pinned') {
      list = list.filter((d) => d.isPinned);
    } else if (statusFilter === 'locked') {
      list = list.filter((d) => d.isLocked);
    } else if (statusFilter === 'archived') {
      list = list.filter((d) => d.isArchived);
    } else if (statusFilter === 'announcements') {
      list = list.filter((d) => d.isAnnouncement);
    } else if (statusFilter === 'unanswered') {
      list = list.filter((d) => d.repliesCount === 0);
    }

    list = [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'most_replies') return b.repliesCount - a.repliesCount;
      if (sortBy === 'most_active' || sortBy === 'recently_updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return 0;
    });

    return list;
  }, [discussions, courseUuid, searchQuery, selectedCategory, createdByFilter, statusFilter, sortBy]);

  // Metrics
  const courseDiscussions = discussions.filter((d) => d.courseUuid === courseUuid);
  const totalCount = courseDiscussions.length;
  const openCount = courseDiscussions.filter((d) => !d.isResolved && !d.isArchived).length;
  const pinnedCount = courseDiscussions.filter((d) => d.isPinned).length;
  const lockedCount = courseDiscussions.filter((d) => d.isLocked).length;
  const resolvedCount = courseDiscussions.filter((d) => d.isResolved).length;
  const totalRepliesCount = replies.filter((r) =>
    courseDiscussions.some((d) => d.id === r.discussionId)
  ).length;
  const unreadCount = courseDiscussions.filter((d) => d.repliesCount === 0).length;
  const pendingReportsCount = reports.filter((rep) => rep.status === 'pending').length;

  const totalUnreadChats = personalChats.reduce((sum, c) => sum + c.unreadCount, 0);

  const activeDiscussion = activeDiscussionUuid
    ? courseDiscussions.find((d) => d.id === activeDiscussionUuid) || null
    : null;

  const handleSelectSection = (sec: 'community' | 'personal') => {
    if (sec === 'community') {
      navigate(`/courses/${courseUuid}/discussions/community`);
    } else {
      navigate(`/courses/${courseUuid}/discussions/personal`);
    }
  };

  const handleOpenThread = (id: string) => {
    incrementViews(id);
    navigate(`/courses/${courseUuid}/discussions/community/${id}`);
  };

  const handleBackToList = () => {
    navigate(`/courses/${courseUuid}/discussions/community`);
  };

  const handleSelectStudentChat = (studentUuid: string) => {
    if (studentUuid) {
      navigate(`/courses/${courseUuid}/discussions/personal/${studentUuid}`);
    } else {
      navigate(`/courses/${courseUuid}/discussions/personal`);
    }
  };

  const handleSaveDiscussionForm = (data: any) => {
    if (editingDiscussion) {
      updateDiscussion(editingDiscussion.id, data);
      setEditingDiscussion(null);
    } else {
      addDiscussion({
        ...data,
        courseUuid,
      });
    }
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      {/* 1. PAGE HEADER */}
      <DiscussionHomeHeader
        totalCount={totalCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. PERMANENT SECTION TABS ([ Community Discussions ] | [ Personal Chats ]) */}
      <DiscussionsSectionTabs
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        unreadChatCount={totalUnreadChats}
        communityTopicCount={totalCount}
      />

      {/* 3. SECTION CONTENT BASED ON FEATURE TOGGLE */}
      {activeSection === 'community' ? (
        /* COMMUNITY DISCUSSIONS SECTION */
        !courseFeatures.courseDiscussion ? (
          <FeatureDisabledBanner
            featureTitle="Community Discussions"
            description="Community Discussions are currently disabled for this course in Course Features settings."
            courseUuid={courseUuid}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6">
              {activeDiscussion ? (
                /* THREAD VIEW */
                <DiscussionThreadView
                  discussion={activeDiscussion}
                  replies={replies}
                  onBack={handleBackToList}
                  onAddReply={(content, parentReplyId, mentions, quotedReply) => {
                    addReply({
                      discussionId: activeDiscussion.id,
                      parentReplyId,
                      content,
                      author: {
                        uuid: 'inst-1',
                        name: 'Dr. Vikramaditya Rao',
                        role: 'instructor',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                      },
                      mentions,
                      quotedReply,
                    });
                  }}
                  onLikeDiscussion={toggleLikeDiscussion}
                  onLikeReply={toggleLikeReply}
                  onPinReply={togglePinReply}
                  onMarkOfficialAnswer={markOfficialAnswer}
                  onDeleteReply={deleteReply}
                  onReport={(discId, replyId) => {
                    reportItem({
                      discussionId: discId,
                      replyId,
                      reportedBy: 'Dr. Vikramaditya Rao',
                      reason: 'Off Topic',
                      snippet: 'Reported conversation item',
                    });
                  }}
                  onReaction={(replyId, emoji) =>
                    toggleReplyReaction(replyId, emoji, 'Dr. Vikramaditya Rao')
                  }
                  isInstructor={true}
                  currentUserRole="instructor"
                />
              ) : (
                /* COMMUNITY FORUM FEED */
                <>
                  <DiscussionSummaryCards
                    total={totalCount}
                    open={openCount}
                    pinned={pinnedCount}
                    locked={lockedCount}
                    resolved={resolvedCount}
                    totalReplies={totalRepliesCount}
                    unread={unreadCount}
                    reported={pendingReportsCount}
                    onFilterByStatus={(st) => {
                      if (st === 'reported') {
                        setIsModerationOpen(true);
                      } else {
                        setStatusFilter(st);
                      }
                    }}
                  />

                  <DiscussionFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    createdByFilter={createdByFilter}
                    onCreatedByChange={setCreatedByFilter}
                    onReset={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setStatusFilter('all');
                      setSortBy('newest');
                      setCreatedByFilter('all');
                    }}
                  />

                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} padding="md" className="space-y-3 bg-white border border-slate-200">
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : filteredDiscussions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredDiscussions.map((disc) => (
                        <DiscussionListCard
                          key={disc.id}
                          discussion={disc}
                          onOpen={handleOpenThread}
                          onEdit={(d) => {
                            setEditingDiscussion(d);
                            setIsCreateModalOpen(true);
                          }}
                          onTogglePin={togglePinDiscussion}
                          onToggleLock={toggleLockDiscussion}
                          onToggleArchive={toggleArchiveDiscussion}
                          onToggleResolve={toggleResolveDiscussion}
                          onDelete={deleteDiscussion}
                          onLike={toggleLikeDiscussion}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card padding="lg" className="bg-white border border-slate-200 text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h3 className="text-base font-extrabold text-slate-900">No Discussions Found</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Create your first course discussion topic to start communicating, answering questions, and collaborating with your students.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingDiscussion(null);
                          setIsCreateModalOpen(true);
                        }}
                        className="bg-[#2563EB] text-white font-bold text-xs px-6"
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Create Discussion
                      </Button>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* RIGHT DESKTOP SIDEBAR */}
            <div className="hidden lg:block lg:col-span-1">
              <CourseMembersSidebar members={courseMembers} />
            </div>
          </div>
        )
      ) : (
        /* PERSONAL CHAT SECTION */
        !courseFeatures.courseChat ? (
          <FeatureDisabledBanner
            featureTitle="Personal Chat"
            description="Personal Chat is currently disabled for this course in Course Features settings."
            courseUuid={courseUuid}
          />
        ) : (
          <PersonalChatView
            courseUuid={courseUuid}
            conversations={personalChats}
            courseMembers={courseMembers}
            activeStudentUuid={activeStudentUuid}
            onSelectStudentChat={handleSelectStudentChat}
            onSendMessage={(studentUuid, content, attachments) =>
              sendPersonalMessage(courseUuid, studentUuid, content, 'instructor', attachments)
            }
            onMarkSeen={markChatAsSeen}
          />
        )
      )}

      {/* SHARED MODALS */}
      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingDiscussion(null);
        }}
        onSubmit={handleSaveDiscussionForm}
        editingDiscussion={editingDiscussion}
        isInstructor={true}
      />

      <ModerationQueueModal
        isOpen={isModerationOpen}
        onClose={() => setIsModerationOpen(false)}
        reports={reports}
        onAction={handleReportAction}
      />

      <DiscussionAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        discussions={courseDiscussions}
        replies={replies}
      />

      <ExportDiscussionsModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        discussions={courseDiscussions}
        replies={replies}
      />

      <DiscussionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={courseSettings}
        onSave={(newSettings) => updateCourseSettings(courseUuid, newSettings)}
      />
    </div>
  );
};
