import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Download,
  BarChart3,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';

// Store & Components
import { useAnnouncementStore, type AnnouncementItem } from '../../announcements/store/announcement.store';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';
import { FeatureDisabledBanner } from '../../discussions/components/FeatureDisabledBanner';

import { AnnouncementSummaryCards } from '../../announcements/components/AnnouncementSummaryCards';
import { AnnouncementFilters } from '../../announcements/components/AnnouncementFilters';
import { AnnouncementCard } from '../../announcements/components/AnnouncementCard';
import { CreateAnnouncementModal } from '../../announcements/components/CreateAnnouncementModal';
import { AnnouncementDetailModal } from '../../announcements/components/AnnouncementDetailModal';
import { AnnouncementAnalyticsModal } from '../../announcements/components/AnnouncementAnalyticsModal';
import { ExportAnnouncementsModal } from '../../announcements/components/ExportAnnouncementsModal';

export const CourseAnnouncementsPage: React.FC = () => {
  const params = useParams<{ courseUuid?: string; '*': string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const courseUuid = params.courseUuid || '';

  // Subroute action handling
  const subPath = (params['*'] || '').replace(/^\/+/, '');
  const pathSegments = subPath.split('/').filter(Boolean);

  const isCreateRoute = location.pathname.endsWith('/create');
  const targetAnnouncementUuid = !isCreateRoute && pathSegments[0] ? pathSegments[0] : null;
  const isEditRoute = location.pathname.endsWith('/edit');

  // Course Feature Flags
  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const courseFeatures = getCourseFeatures ? getCourseFeatures(courseUuid) : (useCourseFeaturesStore.getState().featuresByCourse[courseUuid] || DEFAULT_COURSE_FEATURES);

  // Announcement Store State
  const announcements = useAnnouncementStore((state) => state.announcements);
  const addAnnouncement = useAnnouncementStore((state) => state.addAnnouncement);
  const updateAnnouncement = useAnnouncementStore((state) => state.updateAnnouncement);
  const deleteAnnouncement = useAnnouncementStore((state) => state.deleteAnnouncement);
  const duplicateAnnouncement = useAnnouncementStore((state) => state.duplicateAnnouncement);
  const publishAnnouncement = useAnnouncementStore((state) => state.publishAnnouncement);
  const archiveAnnouncement = useAnnouncementStore((state) => state.archiveAnnouncement);
  const togglePinAnnouncement = useAnnouncementStore((state) => state.togglePinAnnouncement);
  const addComment = useAnnouncementStore((state) => state.addComment);
  const deleteComment = useAnnouncementStore((state) => state.deleteComment);
  const toggleCommentLike = useAnnouncementStore((state) => state.toggleCommentLike);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);

  const [activeDetailAnnouncement, setActiveDetailAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Handle route-triggered modals
  useEffect(() => {
    if (isCreateRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingAnnouncement(null);
      setIsCreateModalOpen(true);
    } else if (targetAnnouncementUuid) {
      const found = announcements.find((a) => a.id === targetAnnouncementUuid);
      if (found) {
        if (isEditRoute) {
          setEditingAnnouncement(found);
          setIsCreateModalOpen(true);
        } else {
          setActiveDetailAnnouncement(found);
        }
      }
    }
  }, [location.pathname, targetAnnouncementUuid, isCreateRoute, isEditRoute, announcements]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Filtered List
  const courseAnnouncements = useMemo(() => {
    return announcements.filter((a) => a.courseUuid === courseUuid);
  }, [announcements, courseUuid]);

  const filteredAnnouncements = useMemo(() => {
    let list = [...courseAnnouncements];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All') {
      list = list.filter((a) => a.category === categoryFilter);
    }

    if (statusFilter === 'published') {
      list = list.filter((a) => a.status === 'published');
    } else if (statusFilter === 'scheduled') {
      list = list.filter((a) => a.status === 'scheduled');
    } else if (statusFilter === 'draft') {
      list = list.filter((a) => a.status === 'draft');
    } else if (statusFilter === 'pinned') {
      list = list.filter((a) => a.isPinned);
    } else if (statusFilter === 'archived') {
      list = list.filter((a) => a.status === 'archived');
    }

    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'most_read') return b.viewsCount - a.viewsCount;
      if (sortBy === 'recently_updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return 0;
    });

    return list;
  }, [courseAnnouncements, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Metrics
  const total = courseAnnouncements.length;
  const published = courseAnnouncements.filter((a) => a.status === 'published').length;
  const scheduled = courseAnnouncements.filter((a) => a.status === 'scheduled').length;
  const drafts = courseAnnouncements.filter((a) => a.status === 'draft').length;
  const pinned = courseAnnouncements.filter((a) => a.isPinned).length;
  const archived = courseAnnouncements.filter((a) => a.status === 'archived').length;

  const readRatePercent =
    published > 0
      ? Math.round(
          courseAnnouncements
            .filter((a) => a.status === 'published')
            .reduce((sum, a) => {
              const readCount = a.readReceipts.filter((r) => r.isRead).length;
              const tot = a.readReceipts.length || 1;
              return sum + (readCount / tot) * 100;
            }, 0) / published
        )
      : 0;

  const unreadStudentsCount = courseAnnouncements.reduce((sum, a) => {
    return sum + a.readReceipts.filter((r) => !r.isRead).length;
  }, 0);

  const handleOpenAnnouncement = (id: string) => {
    const found = announcements.find((a) => a.id === id);
    if (found) {
      setActiveDetailAnnouncement(found);
      navigate(`/courses/${courseUuid}/announcements/${id}`);
    }
  };

  const handleCreateNew = () => {
    setEditingAnnouncement(null);
    setIsCreateModalOpen(true);
    navigate(`/courses/${courseUuid}/announcements/create`);
  };

  const handleEdit = (announcement: AnnouncementItem) => {
    setEditingAnnouncement(announcement);
    setIsCreateModalOpen(true);
    navigate(`/courses/${courseUuid}/announcements/${announcement.id}/edit`);
  };

  const handleSaveForm = (data: Partial<AnnouncementItem>) => {
    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, data);
    } else {
      addAnnouncement({
        ...data,
        courseUuid,
      } as Parameters<typeof addAnnouncement>[0]);
    }
    navigate(`/courses/${courseUuid}/announcements`);
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Course Announcements</h1>
              <Badge variant="info" size="sm" className="font-bold">
                {total} Total
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Send important updates, exam schedules, and notifications directly to all enrolled students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportOpen(true)}
              className="h-9 text-xs font-semibold text-slate-700"
              leftIcon={<Download className="w-4 h-4 text-blue-600" />}
            >
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsOpen(true)}
              className="h-9 text-xs font-semibold text-slate-700"
              leftIcon={<BarChart3 className="w-4 h-4 text-indigo-600" />}
            >
              Analytics
            </Button>

            <Button
              size="sm"
              onClick={handleCreateNew}
              className="h-9 bg-[#2563EB] text-white font-extrabold text-xs px-4 hover:bg-blue-700"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              Create Announcement
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. FEATURE DISABLED CHECK */}
      {!courseFeatures.courseAnnouncements ? (
        <FeatureDisabledBanner
          featureTitle="Course Announcements"
          description="Course Announcements are currently disabled for this course in Course Features settings."
          courseUuid={courseUuid}
        />
      ) : (
        <>
          {/* 3. SUMMARY CARDS */}
          <AnnouncementSummaryCards
            total={total}
            published={published}
            scheduled={scheduled}
            drafts={drafts}
            pinned={pinned}
            archived={archived}
            readRatePercent={readRatePercent}
            unreadStudentsCount={unreadStudentsCount}
            onFilterByStatus={(st) => setStatusFilter(st)}
          />

          {/* 4. SEARCH & FILTERS */}
          <AnnouncementFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onReset={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('All');
              setSortBy('newest');
            }}
          />

          {/* 5. ANNOUNCEMENT CARDS FEED */}
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
          ) : filteredAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {filteredAnnouncements.map((anc) => (
                <AnnouncementCard
                  key={anc.id}
                  announcement={anc}
                  onOpen={handleOpenAnnouncement}
                  onEdit={handleEdit}
                  onDuplicate={duplicateAnnouncement}
                  onPublish={publishAnnouncement}
                  onTogglePin={togglePinAnnouncement}
                  onArchive={archiveAnnouncement}
                  onDelete={deleteAnnouncement}
                />
              ))}
            </div>
          ) : (
            <Card padding="lg" className="bg-white border border-slate-200 text-center py-14 space-y-4 font-sans">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Megaphone className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-slate-900">No Announcements Found</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Create your first course announcement to notify all enrolled students about schedule updates, assignments, and exam news.
                </p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="bg-[#2563EB] text-white font-extrabold text-xs px-6"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Announcement
              </Button>
            </Card>
          )}
        </>
      )}

      {/* SHARED MODALS */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAnnouncement(null);
          navigate(`/courses/${courseUuid}/announcements`);
        }}
        onSubmit={handleSaveForm}
        editingAnnouncement={editingAnnouncement}
      />

      <AnnouncementDetailModal
        isOpen={!!activeDetailAnnouncement}
        onClose={() => {
          setActiveDetailAnnouncement(null);
          navigate(`/courses/${courseUuid}/announcements`);
        }}
        announcement={activeDetailAnnouncement}
        onAddComment={(announcementId, content) =>
          addComment(
            announcementId,
            { uuid: 'inst-1', name: 'Instructor', role: 'instructor' },
            content
          )
        }
        onDeleteComment={deleteComment}
        onLikeComment={toggleCommentLike}
      />

      <AnnouncementAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        announcements={courseAnnouncements}
      />

      <ExportAnnouncementsModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        announcements={courseAnnouncements}
      />
    </div>
  );
};
