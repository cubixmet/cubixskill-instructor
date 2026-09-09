import React, { useState, useMemo, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Download,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { usePlatformStore } from '../../../store/usePlatformStore';

import { discussionService } from '../../../services/discussion.service';
import { useCreditSummary } from '../../../hooks/useCreditSummary';

import { useAnnouncementStore, type AnnouncementItem } from '../store/announcement.store';
import { AnnouncementSummaryCards } from '../components/AnnouncementSummaryCards';
import { AnnouncementFilters } from '../components/AnnouncementFilters';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { CreateAnnouncementModal } from '../components/CreateAnnouncementModal';
import { AnnouncementDetailModal } from '../components/AnnouncementDetailModal';
import { AnnouncementAnalyticsModal } from '../components/AnnouncementAnalyticsModal';
import { ExportAnnouncementsModal } from '../components/ExportAnnouncementsModal';

export const GlobalAnnouncementsPage: React.FC = () => {
  const { applyCreditDebitResult } = useCreditSummary();
  const courses = usePlatformStore((state) => state.courses || []);

  const announcements = useAnnouncementStore((state) => state.announcements);
  const addAnnouncement = useAnnouncementStore((state) => state.addAnnouncement);
  const updateAnnouncement = useAnnouncementStore((state) => state.updateAnnouncement);
  const deleteAnnouncement = useAnnouncementStore((state) => state.deleteAnnouncement);
  const duplicateAnnouncement = useAnnouncementStore((state) => state.duplicateAnnouncement);
  const publishAnnouncement = useAnnouncementStore((state) => state.publishAnnouncement);
  const togglePinAnnouncement = useAnnouncementStore((state) => state.togglePinAnnouncement);
  const archiveAnnouncement = useAnnouncementStore((state) => state.archiveAnnouncement);
  const addComment = useAnnouncementStore((state) => state.addComment);
  const deleteComment = useAnnouncementStore((state) => state.deleteComment);
  const toggleCommentLike = useAnnouncementStore((state) => state.toggleCommentLike);

  // Filters State
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
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

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const filteredAnnouncements = useMemo(() => {
    let list = [...announcements];

    if (selectedCourseFilter !== 'all') {
      list = list.filter((a) => a.courseUuid === selectedCourseFilter);
    }

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
  }, [announcements, selectedCourseFilter, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Metrics
  const total = announcements.length;
  const published = announcements.filter((a) => a.status === 'published').length;
  const scheduled = announcements.filter((a) => a.status === 'scheduled').length;
  const drafts = announcements.filter((a) => a.status === 'draft').length;
  const pinned = announcements.filter((a) => a.isPinned).length;
  const archived = announcements.filter((a) => a.status === 'archived').length;

  const readRatePercent =
    published > 0
      ? Math.round(
          announcements
            .filter((a) => a.status === 'published')
            .reduce((sum, a) => {
              const readCount = a.readReceipts.filter((r) => r.isRead).length;
              const tot = a.readReceipts.length || 1;
              return sum + (readCount / tot) * 100;
            }, 0) / published
        )
      : 0;

  const unreadStudentsCount = announcements.reduce((sum, a) => {
    return sum + a.readReceipts.filter((r) => !r.isRead).length;
  }, 0);

  const handleSaveForm = (data: Partial<AnnouncementItem>) => {
    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, data);
    } else {
      addAnnouncement(data);
      if (data.courseUuid) {
        discussionService.createDiscussion({
          course_id: data.courseUuid,
          title: data.title || 'Course Announcement',
          content: data.content || data.summary || '',
          thread_type: 'ANNOUNCEMENT',
          send_email: data.sendEmail,
        }).then((res: any) => {
          if (res?.credit_balance !== undefined) {
            applyCreditDebitResult({ serverBalance: res.credit_balance });
          }
        }).catch((err) => console.warn('Failed to sync global announcement to backend:', err));
      }
    }
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      {/* HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Global Academy Announcements</h1>
              <Badge variant="info" size="sm" className="font-bold">
                {total} Announcements
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage and dispatch announcements across all academy courses from a centralized dashboard.
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
              onClick={() => {
                setEditingAnnouncement(null);
                setIsCreateModalOpen(true);
              }}
              className="h-9 bg-[#2563EB] text-white font-extrabold text-xs px-4 hover:bg-blue-700"
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
            >
              Create Announcement
            </Button>
          </div>
        </div>
      </Card>

      {/* SUMMARY CARDS */}
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

      {/* COURSE SELECTOR BAR & FILTERS */}
      <div className="space-y-3">
        <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs font-sans text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold text-slate-900">Filter by Course:</span>
          </div>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-xs focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Academy Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

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
            setSelectedCourseFilter('all');
            setSearchQuery('');
            setStatusFilter('all');
            setCategoryFilter('All');
            setSortBy('newest');
          }}
        />
      </div>

      {/* ANNOUNCEMENTS CARDS LIST */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md" className="space-y-3 bg-white border border-slate-200">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="space-y-3">
          {filteredAnnouncements.map((anc) => (
            <AnnouncementCard
              key={anc.id}
              announcement={anc}
              onOpen={(id) => {
                const found = announcements.find((a) => a.id === id);
                if (found) setActiveDetailAnnouncement(found);
              }}
              onEdit={(anc) => {
                setEditingAnnouncement(anc);
                setIsCreateModalOpen(true);
              }}
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
              Create an announcement and select your target course to notify students.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingAnnouncement(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-[#2563EB] text-white font-extrabold text-xs px-6"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Announcement
          </Button>
        </Card>
      )}

      {/* MODALS */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAnnouncement(null);
        }}
        onSubmit={handleSaveForm}
        editingAnnouncement={editingAnnouncement}
      />

      <AnnouncementDetailModal
        isOpen={!!activeDetailAnnouncement}
        onClose={() => setActiveDetailAnnouncement(null)}
        announcement={activeDetailAnnouncement}
        onAddComment={(announcementId, content) =>
          addComment(
            announcementId,
            { uuid: 'inst-1', name: 'Dr. Rajesh Sharma', role: 'instructor' },
            content
          )
        }
        onDeleteComment={deleteComment}
        onLikeComment={toggleCommentLike}
      />

      <AnnouncementAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        announcements={announcements}
      />

      <ExportAnnouncementsModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        announcements={announcements}
      />
    </div>
  );
};
