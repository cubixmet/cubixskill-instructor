import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

// Store & Components
import { useDiscussionStore, type DiscussionItem } from '../../discussions/store/discussion.store';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';
import { useCommunityDiscussionsSocket } from '../../discussions/hooks/useCommunityDiscussionsSocket';
import { DiscussionsSectionTabs } from '../../discussions/components/DiscussionsSectionTabs';
import { FeatureDisabledBanner } from '../../discussions/components/FeatureDisabledBanner';
import { DiscussionHomeHeader } from '../../discussions/components/DiscussionHomeHeader';
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

import { normalizeCourseId } from '../../../utils/courseValidation.utils';
import { courseRoutes } from '../../../utils/courseRoutes.utils';

import { coursesService } from '../../../services/courses.service';
import { discussionService } from '../../../services/discussion.service';

export const CourseDiscussionsPage: React.FC = () => {
  const params = useParams<{ courseUuid?: string; '*': string }>();
  const navigate = useNavigate();

  const rawCourseUuid = params.courseUuid;
  const courseUuid = normalizeCourseId(rawCourseUuid);

  // Connect to Real WebSocket for Community Discussions
  const { connectionState } = useCommunityDiscussionsSocket(true);

  const location = useLocation();

  // Subpath parsing for routing
  const subPath = (params['*'] || '').replace(/^\/+/, '');
  const pathSegments = subPath.split('/').filter(Boolean);

  // Section determination: 'community' vs 'personal'
  const isPersonalSection = location.pathname.includes('/discussions/personal') || pathSegments[0] === 'personal';
  const activeSection: 'community' | 'personal' = isPersonalSection ? 'personal' : 'community';

  // Specific UUID targets
  const personalMatch = location.pathname.match(/\/discussions\/personal\/([^/]+)/);
  const communityMatch = location.pathname.match(/\/discussions\/community\/([^/]+)/);

  const activeStudentUuid = isPersonalSection ? (personalMatch ? personalMatch[1] : pathSegments[1] || null) : null;
  const activeDiscussionUuid = !isPersonalSection ? (communityMatch ? communityMatch[1] : pathSegments[1] || null) : null;

  // Real Courses for dropdown & creation
  const [realCourses, setRealCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string | null>(courseUuid || null);

  useEffect(() => {
    if (courseUuid) {
      setSelectedCourseFilter(courseUuid);
    }
  }, [courseUuid]);

  useEffect(() => {
    let isMounted = true;
    coursesService
      .listCourses()
      .then((res) => {
        if (!isMounted) return;
        const items = Array.isArray(res) ? res : res?.results || [];
        setRealCourses(items.map((c: any) => ({ id: String(c.id), title: String(c.title || 'Untitled Course') })));
      })
      .catch(() => {
        // ignore errors safely
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Course Feature Flags
  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const courseFeatures = getCourseFeatures && courseUuid ? getCourseFeatures(courseUuid) : DEFAULT_COURSE_FEATURES;

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

  const courseSettings = getCourseSettings(courseUuid || '');
  const courseMembers = getCourseMembers(courseUuid || '');
  const personalChats = getCoursePersonalChats(courseUuid || '');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [createdByFilter, setCreatedByFilter] = useState('all');

  // REST Load State for Real Backend Community Discussions
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCommunityDiscussions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await discussionService.listDiscussions({
        courseId: selectedCourseFilter || courseUuid || undefined,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      const items = (res.results || []).map((t: any) => ({
        id: String(t.id),
        courseUuid: String(t.course || courseUuid || ''),
        title: t.title || 'Untitled Thread',
        shortDescription: t.content ? t.content.slice(0, 120) : '',
        content: t.content || '',
        category: (t.thread_type === 'ANNOUNCEMENT' ? 'Announcements' : t.thread_type === 'QUESTION' ? 'Q&A' : 'General') as any,
        tags: [],
        author: {
          uuid: String(t.author_id || ''),
          name: t.author_name || t.author_email || 'Author',
          role: (t.author_role || 'student') as any,
        },
        createdAt: t.created_at || new Date().toISOString(),
        updatedAt: t.last_activity_at || t.created_at || new Date().toISOString(),
        repliesCount: typeof t.reply_count === 'number' ? t.reply_count : 0,
        views: typeof t.views === 'number' ? t.views : 0,
        likes: typeof t.likes === 'number' ? t.likes : 0,
        userLiked: false,
        isPinned: Boolean(t.is_pinned),
        isLocked: Boolean(t.is_locked),
        isArchived: Boolean(t.status === 'ARCHIVED'),
        isResolved: Boolean(t.accepted_answer_id),
        isAnnouncement: t.thread_type === 'ANNOUNCEMENT',
        officialAnswerReplyId: t.accepted_answer_id ? String(t.accepted_answer_id) : undefined,
        attachments: (t.attachments || []).map((att: any) => ({
          id: String(att.id),
          name: att.original_name || 'Attachment',
          sizeMb: 1.0,
          type: 'doc',
          url: att.media_url || '#',
        })),
        visibility: 'all' as const,
        allowReplies: !t.is_locked,
        allowStudentAttachments: true,
        notifyStudents: true,
      }));

      // Populate Zustand store cleanly with authoritative database records
      useDiscussionStore.setState({ discussions: items });
    } catch {
      setLoadError("Couldn't load community discussions.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseFilter, courseUuid, searchQuery, statusFilter]);

  useEffect(() => {
    loadCommunityDiscussions();
  }, [loadCommunityDiscussions]);

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<DiscussionItem | null>(null);

  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filtered discussions list
  const activeCourseId = selectedCourseFilter || courseUuid;
  const filteredDiscussions = useMemo(() => {
    let list = activeCourseId ? discussions.filter((d) => d.courseUuid === activeCourseId) : discussions;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q) ||
          d.author.name.toLowerCase().includes(q)
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
  }, [discussions, activeCourseId, searchQuery, selectedCategory, createdByFilter, statusFilter, sortBy]);

  // Metrics
  const courseDiscussions = discussions.filter((d) => d.courseUuid === courseUuid);
  const totalCount = courseDiscussions.length;

  const totalUnreadChats = personalChats.reduce((sum, c) => sum + c.unreadCount, 0);

  const activeDiscussion = activeDiscussionUuid
    ? courseDiscussions.find((d) => d.id === activeDiscussionUuid) || null
    : null;

  const handleSelectSection = (sec: 'community' | 'personal') => {
    if (sec === 'community') {
      navigate(courseRoutes.discussions.community(courseUuid));
    } else {
      navigate(courseRoutes.discussions.personal(courseUuid));
    }
  };

  const handleOpenThread = (id: string) => {
    incrementViews(id);
    navigate(courseRoutes.discussions.community(courseUuid, id));
  };

  const handleBackToList = () => {
    navigate(courseRoutes.discussions.community(courseUuid));
  };

  const handleSelectStudentChat = (studentUuid: string) => {
    if (studentUuid) {
      navigate(courseRoutes.discussions.personal(courseUuid, studentUuid));
    } else {
      navigate(courseRoutes.discussions.personal(courseUuid));
    }
  };

  const handleSaveDiscussionForm = async (data: Partial<DiscussionItem> & { course_id?: string | null }) => {
    const targetCourseId = data.course_id !== undefined ? data.course_id : (selectedCourseFilter || courseUuid);
    try {
      if (editingDiscussion) {
        const updated = await discussionService.updateDiscussion(editingDiscussion.id, {
          title: data.title,
          content: data.content,
        });
        updateDiscussion(editingDiscussion.id, {
          title: updated.title,
          content: updated.content,
        });
        setEditingDiscussion(null);
      } else {
        const created = await discussionService.createDiscussion({
          course_id: targetCourseId,
          title: data.title || '',
          content: data.content || '',
          thread_type: data.isAnnouncement ? 'ANNOUNCEMENT' : 'DISCUSSION',
        });
        loadCommunityDiscussions();
      }
    } catch {
      // Handled cleanly
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-24 sm:pb-8 px-2.5 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0">
      {/* 1. PAGE HEADER WITH REAL WEBSOCKET CONNECTION BADGE */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <DiscussionHomeHeader
          totalCount={totalCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionState === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : connectionState === 'reconnecting' || connectionState === 'connecting'
                ? 'bg-amber-500 animate-ping'
                : 'bg-rose-500'
            }`}
          />
          <span className="capitalize">{connectionState === 'connected' ? 'Live WebSocket' : connectionState}</span>
        </div>
      </div>

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
                  <DiscussionFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCourseId={selectedCourseFilter}
                    onCourseChange={(cId) => setSelectedCourseFilter(cId)}
                    coursesList={realCourses}
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
                      setSelectedCourseFilter(courseUuid || null);
                      setSelectedCategory('All');
                      setStatusFilter('all');
                      setSortBy('recent');
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
                  ) : loadError ? (
                    <Card padding="lg" className="text-center space-y-3 bg-white dark:bg-[#111827] border border-rose-200 dark:border-rose-900/40">
                      <p className="font-semibold text-rose-600 dark:text-rose-400 text-sm">{loadError}</p>
                      <Button size="sm" variant="outline" onClick={loadCommunityDiscussions}>
                        Try Again
                      </Button>
                    </Card>
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
                    <EmptyState
                      icon={MessageSquare}
                      title="No Discussions Found"
                      description="Create your first course discussion topic to start communicating, answering questions, and collaborating with your students."
                      actionLabel="Create Discussion"
                      onAction={() => {
                        setEditingDiscussion(null);
                        setIsCreateModalOpen(true);
                      }}
                      actionIcon={<Plus className="w-4 h-4" />}
                    />
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
            activeStudentUuid={activeStudentUuid}
            onSelectStudentChat={handleSelectStudentChat}
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
        coursesList={realCourses}
        initialCourseId={selectedCourseFilter || courseUuid || null}
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
