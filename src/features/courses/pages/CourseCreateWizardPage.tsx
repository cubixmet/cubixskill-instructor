import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  Image as ImageIcon,
  Video as VideoIcon,
  AlertTriangle,
  X,
  Upload,
  GitMerge,
  Loader2,
  Link2,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import { SearchableCategorySelector } from "../components/SearchableCategorySelector";
import { coursesService } from "../../../services/courses.service";
import { normalizeCourseId, buildCourseDetailPath } from "../../../utils/courseValidation.utils";
import { SearchableLanguageSelector } from "../components/SearchableLanguageSelector";
import { CategoryMergeModal } from "../components/CategoryMergeModal";
import { useAuthStore } from "../../../store/auth.store";
import { resolveMediaUrl } from "../../../utils/media.utils";

const wizardSchema = z.object({
  title: z.string().trim().min(3, "Course title is required (min 3 characters)."),
  subtitle: z.string().optional(),
  short_description: z.string().trim().min(10, "Short description is required (min 10 characters)."),
  description: z.string().optional(),
  category: z.string().nullable().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).default("BEGINNER"),
  language: z.string().default("English"),
  is_free: z.boolean().default(false),
  price: z.coerce.number().min(0).default(0),
  currency: z.string().default("INR"),
  demo_enabled: z.boolean().default(false),
  demo_duration_days: z.coerce.number().min(0).default(0),
  certificate_enabled: z.boolean().default(true),
  thumbnail_url: z.string().optional(),
  promo_video_url: z.string().optional(),
});

export type WizardFormValues = z.infer<typeof wizardSchema>;

type MediaSourceMode = "UPLOAD" | "URL";

export const CourseCreateWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid } = useParams<{ courseUuid?: string }>();
  const { can } = useAuthStore();

  // Thumbnail State
  const [thumbnailMode, setThumbnailMode] = useState<MediaSourceMode>("UPLOAD");
  const [thumbnailMediaId, setThumbnailMediaId] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isThumbnailUrlBroken, setIsThumbnailUrlBroken] = useState(false);

  // Promo Video State
  const [promoVideoMode, setPromoVideoMode] = useState<MediaSourceMode>("UPLOAD");
  const [promoVideoMediaId, setPromoVideoMediaId] = useState<string | null>(null);
  const [promoVideoPreviewUrl, setPromoVideoPreviewUrl] = useState<string | null>(null);
  const [customPromoVideoUrl, setCustomPromoVideoUrl] = useState<string>("");
  const [isUploadingPromoVideo, setIsUploadingPromoVideo] = useState(false);
  const [isPromoVideoUrlBroken, setIsPromoVideoUrlBroken] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      short_description: "",
      description: "",
      category: "",
      level: "BEGINNER",
      language: "English",
      is_free: false,
      price: 0,
      currency: "INR",
      demo_enabled: false,
      demo_duration_days: 0,
      certificate_enabled: true,
      thumbnail_url: "",
      promo_video_url: "",
    },
  });

  const watchIsFree = watch("is_free");

  // Revoke Blob URLs on unmount/change
  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
      if (promoVideoPreviewUrl && promoVideoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(promoVideoPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl, promoVideoPreviewUrl]);

  const scrollToFirstError = (fieldName?: string) => {
    setTimeout(() => {
      let targetEl: HTMLElement | null = null;
      if (fieldName) {
        targetEl =
          document.querySelector(`[name="${fieldName}"]`) ||
          document.querySelector(`[data-field-name="${fieldName}"]`);
      }
      if (!targetEl) {
        targetEl = document.querySelector('[aria-invalid="true"]');
      }
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
        targetEl.focus();
      }
    }, 100);
  };

  // Fetch existing course detail if editing
  const loadInitialData = useCallback(async () => {
    try {
      const validId = normalizeCourseId(courseUuid);
      if (validId) {
        const existing = await coursesService.getCourse(validId);
        reset({
          title: existing.title,
          subtitle: existing.subtitle || "",
          short_description: existing.short_description || "",
          description: existing.description || "",
          category: existing.category?.id || "",
          level: existing.level,
          language: existing.language,
          is_free: existing.is_free,
          price: Number(existing.price) || 0,
          currency: existing.currency || "INR",
          demo_enabled: existing.demo_enabled,
          demo_duration_days: existing.demo_duration_days,
          certificate_enabled: existing.certificate_enabled,
          thumbnail_url: existing.thumbnail_url || "",
          promo_video_url: existing.promo_video_url || "",
        });

        // Restore Thumbnail
        if (existing.thumbnail) {
          setThumbnailMode("UPLOAD");
          setThumbnailMediaId(existing.thumbnail.id);
          setThumbnailPreviewUrl(resolveMediaUrl(existing.thumbnail));
        } else if (existing.thumbnail_url) {
          setThumbnailMode("URL");
          setCustomThumbnailUrl(existing.thumbnail_url);
        }

        // Restore Promo Video
        if (existing.promo_video) {
          setPromoVideoMode("UPLOAD");
          setPromoVideoMediaId(existing.promo_video.id);
          setPromoVideoPreviewUrl(resolveMediaUrl(existing.promo_video));
        } else if (existing.promo_video_url) {
          setPromoVideoMode("URL");
          setCustomPromoVideoUrl(existing.promo_video_url);
        }
      }
    } catch (err: any) {
      setServerError("Failed to initialize course form data.");
    }
  }, [courseUuid, reset]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Thumbnail File Upload Handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Invalid file type. Please select an image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds maximum 10MB limit.");
      return;
    }

    if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    const localBlobUrl = URL.createObjectURL(file);
    setThumbnailPreviewUrl(localBlobUrl);

    setIsUploadingThumbnail(true);
    try {
      const media = await coursesService.uploadMedia(file);
      setThumbnailMediaId(media.id);
      if (media.url) {
        setThumbnailPreviewUrl(resolveMediaUrl(media.url));
      }
      showToast("Thumbnail uploaded successfully!");
    } catch (err: any) {
      showToast("Thumbnail preview active locally.");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // Promo Video File Upload Handler
  const handlePromoVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast("Invalid file type. Please select a video file (MP4, WEBM).");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showToast("Video file size exceeds maximum 100MB limit.");
      return;
    }

    if (promoVideoPreviewUrl && promoVideoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(promoVideoPreviewUrl);
    }

    const localBlobUrl = URL.createObjectURL(file);
    setPromoVideoPreviewUrl(localBlobUrl);

    setIsUploadingPromoVideo(true);
    try {
      const media = await coursesService.uploadMedia(file);
      setPromoVideoMediaId(media.id);
      if (media.url) {
        setPromoVideoPreviewUrl(resolveMediaUrl(media.url));
      }
      showToast("Promo video uploaded successfully!");
    } catch (err: any) {
      showToast("Promo video preview active locally.");
    } finally {
      setIsUploadingPromoVideo(false);
    }
  };

  // Helper for YouTube Embed Parsing
  const getEmbedVideoUrl = (url: string): string => {
    if (!url) return "";
    try {
      if (url.includes("youtube.com/watch")) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      } else if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      } else if (url.includes("vimeo.com/")) {
        const id = url.split("vimeo.com/")[1]?.split("?")[0];
        if (id) return `https://player.vimeo.com/video/${id}`;
      }
    } catch {
      // Fallback to raw URL
    }
    return url;
  };

  const onSubmitForm = async (values: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setServerError(null);

    const payload: any = {
      title: values.title,
      subtitle: values.subtitle || "",
      short_description: values.short_description || "",
      description: values.description || "",
      category: values.category || null,
      level: values.level || "BEGINNER",
      language: values.language || "English",
      is_free: values.is_free,
      price: values.is_free ? 0 : values.price,
      currency: values.currency || "INR",
    };

    // Mode-based Thumbnail assignment
    if (thumbnailMode === "UPLOAD") {
      payload.thumbnail = thumbnailMediaId;
      payload.thumbnail_url = "";
    } else {
      payload.thumbnail = null;
      payload.thumbnail_url = customThumbnailUrl.trim();
    }

    // Mode-based Promo Video assignment
    if (promoVideoMode === "UPLOAD") {
      payload.promo_video = promoVideoMediaId;
      payload.promo_video_url = "";
    } else {
      payload.promo_video = null;
      payload.promo_video_url = getEmbedVideoUrl(customPromoVideoUrl.trim());
    }


    try {
      const validEditId = normalizeCourseId(courseUuid);
      if (validEditId) {
        await coursesService.updateCourse(validEditId, payload);
        showToast("Course updated successfully!");
        navigate(`/courses/${validEditId}/overview`);
      } else {
        const created = await coursesService.createCourse(payload);
        const createdId = normalizeCourseId(created?.id);
        if (!createdId) {
          throw new Error("Course created but backend returned an invalid Course ID.");
        }
        showToast("Course created successfully! Set up course features.");
        navigate(`/courses/${createdId}/features`, { replace: true, state: { isInitialSetup: true } });
      }
    } catch (err: any) {
      const responseData = err?.response?.data;
      if (err?.response?.status === 400 && responseData) {
        const errorsObj = responseData.data || responseData;
        if (typeof errorsObj === "object" && !Array.isArray(errorsObj)) {
          let firstField = "";
          Object.entries(errorsObj).forEach(([field, msg]) => {
            const message = Array.isArray(msg) ? msg[0] : String(msg);
            if (!firstField) firstField = field;
            setError(field as any, { type: "server", message });
          });
          setServerError("Please fix the highlighted field errors below.");
          if (firstField) scrollToFirstError(firstField);
          return;
        }
      }
      setServerError(err?.response?.data?.message || err?.message || "Failed to save course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 text-left font-sans pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#334155] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            {courseUuid ? "Edit Course Settings" : "Create New Course"}
          </h1>
          <p className="text-xs font-normal text-slate-600 dark:text-slate-400 mt-0.5">
            Configure title, category, media assets, level, and pricing rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can("categories.manage") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMergeModalOpen(true)}
              leftIcon={<GitMerge className="w-4 h-4 text-blue-600 dark:text-[#60A5FA]" />}
              className="dark:bg-transparent dark:border-[#3B82F6] dark:text-[#60A5FA] dark:hover:bg-[rgba(37,99,235,0.10)] dark:hover:text-[#93C5FD]"
            >
              Merge Categories
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/courses")}
            className="dark:bg-[#111827] dark:border-[#334155] dark:text-[#CBD5E1] dark:hover:bg-[#172033] dark:hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>

      {serverError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmitForm)} className="w-full max-w-[560px] lg:max-w-none mx-auto space-y-6">
        {/* Basic Details */}
        <Card className="p-4 sm:p-6 space-y-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-[#263244] pb-2">
            1. Basic Information
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              Course Title <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
            </label>
            <Input {...register("title")} name="title" aria-invalid={Boolean(errors.title)} placeholder="e.g. Master React 19 & Next.js" />
            {errors.title && <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Subtitle</label>
            <Input {...register("subtitle")} name="subtitle" placeholder="e.g. Build enterprise apps with Zustand and Tailwind" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
              Short Description <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
            </label>
            <textarea
              {...register("short_description")}
              name="short_description"
              aria-invalid={Boolean(errors.short_description)}
              rows={3}
              placeholder="Brief summary displayed on catalog cards..."
              className={`w-full p-3 bg-white dark:bg-[#0F172A] border text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all ${
                errors.short_description ? "border-rose-500 bg-rose-50/20 dark:border-rose-500 dark:bg-rose-950/20" : "border-slate-300 dark:border-slate-700"
              }`}
            />
            {errors.short_description && <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{errors.short_description.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Full Description</label>
            <textarea
              {...register("description")}
              name="description"
              rows={4}
              placeholder="Comprehensive syllabus overview..."
              className="w-full p-3 bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden transition-all"
            />
          </div>
        </Card>

        {/* Classification & Media */}
        <Card className="p-4 sm:p-6 space-y-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-[#263244] pb-2">
            2. Category & Media Management
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 min-w-0">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Course Category</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <SearchableCategorySelector
                    value={field.value}
                    onChange={(cat) => field.onChange(cat?.id || "")}
                    error={errors.category?.message}
                  />
                )}
              />
            </div>

            <div className="space-y-1 min-w-0">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Difficulty Level</label>
              <select
                {...register("level")}
                name="level"
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden cursor-pointer transition-all h-11"
              >
                <option value="BEGINNER" className="dark:bg-[#111827] dark:text-slate-50">Beginner</option>
                <option value="INTERMEDIATE" className="dark:bg-[#111827] dark:text-slate-50">Intermediate</option>
                <option value="ADVANCED" className="dark:bg-[#111827] dark:text-slate-50">Advanced</option>
                <option value="ALL_LEVELS" className="dark:bg-[#111827] dark:text-slate-50">All Levels</option>
              </select>
            </div>

            <div className="space-y-1 min-w-0">
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <SearchableLanguageSelector
                    value={field.value}
                    onChange={(langName) => field.onChange(langName)}
                    error={errors.language?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* --- THUMBNAIL MEDIA SECTION --- */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#334155]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Course Thumbnail Image</label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Standard 16:9 aspect ratio (Recommended 1280 × 720 px)</p>
              </div>

              {/* Mode Toggle Selector */}
              <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailMode("UPLOAD");
                    setIsThumbnailUrlBroken(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    thumbnailMode === "UPLOAD"
                      ? "bg-white dark:bg-[#172033] text-blue-600 dark:text-[#60A5FA] shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailMode("URL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    thumbnailMode === "URL"
                      ? "bg-white dark:bg-[#172033] text-blue-600 dark:text-[#60A5FA] shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Custom URL</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Mode: UPLOAD */}
            {thumbnailMode === "UPLOAD" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                {thumbnailPreviewUrl ? (
                  <div className="relative w-36 h-20 sm:w-44 sm:h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-[#334155] shrink-0 bg-slate-900 shadow-2xs">
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (thumbnailPreviewUrl && thumbnailPreviewUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(thumbnailPreviewUrl);
                        }
                        setThumbnailMediaId(null);
                        setThumbnailPreviewUrl(null);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg shadow-md cursor-pointer transition-all"
                      title="Remove Thumbnail"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-36 h-20 sm:w-44 sm:h-24 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                    <ImageIcon className="w-6 h-6 mb-1 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold">16:9 Thumbnail</span>
                  </div>
                )}

                <div className="space-y-2 min-w-0 flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-blue-600 dark:text-[#60A5FA] hover:bg-blue-100 dark:hover:bg-[rgba(37,99,235,0.20)] rounded-xl text-xs font-bold cursor-pointer transition-all border border-blue-200 dark:border-[rgba(59,130,246,0.25)]">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingThumbnail ? "Uploading File..." : "Select Thumbnail File"}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/jpg"
                      onChange={handleThumbnailUpload}
                      disabled={isUploadingThumbnail}
                      className="hidden"
                    />
                  </label>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 font-normal leading-normal">
                    <p>• <strong>Formats:</strong> JPG, JPEG, PNG, WEBP • <strong>Max Size:</strong> 10 MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Thumbnail Mode: URL */}
            {thumbnailMode === "URL" && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Custom Image URL</label>
                  <Input
                    type="url"
                    value={customThumbnailUrl}
                    onChange={(e) => {
                      setCustomThumbnailUrl(e.target.value);
                      setIsThumbnailUrlBroken(false);
                    }}
                    placeholder="https://images.unsplash.com/photo-example.jpg"
                  />
                </div>

                {customThumbnailUrl.trim() && (
                  <div className="flex items-center gap-3">
                    <div className="relative w-36 h-20 sm:w-44 sm:h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-[#334155] shrink-0 bg-slate-900 shadow-2xs">
                      {!isThumbnailUrlBroken ? (
                        <img
                          src={customThumbnailUrl.trim()}
                          alt="Custom Thumbnail Preview"
                          className="w-full h-full object-cover"
                          onError={() => setIsThumbnailUrlBroken(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-2 text-center">
                          <AlertTriangle className="w-5 h-5 mb-1 shrink-0" />
                          <span className="text-[10px] font-bold">Image Failed to Load</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {!isThumbnailUrlBroken ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Valid Image URL Preview
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          Invalid or inaccessible image URL. Please check link.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- PROMO VIDEO MEDIA SECTION --- */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#334155]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Course Promo Video</label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Teaser video shown on course sales page</p>
              </div>

              {/* Mode Toggle Selector */}
              <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPromoVideoMode("UPLOAD");
                    setIsPromoVideoUrlBroken(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    promoVideoMode === "UPLOAD"
                      ? "bg-white dark:bg-[#172033] text-blue-600 dark:text-[#60A5FA] shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPromoVideoMode("URL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    promoVideoMode === "URL"
                      ? "bg-white dark:bg-[#172033] text-blue-600 dark:text-[#60A5FA] shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>External URL</span>
                </button>
              </div>
            </div>

            {/* Promo Video Mode: UPLOAD */}
            {promoVideoMode === "UPLOAD" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                {promoVideoPreviewUrl ? (
                  <div className="relative w-44 h-24 sm:w-56 sm:h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-[#334155] shrink-0 bg-slate-900 shadow-2xs">
                    <video
                      src={promoVideoPreviewUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (promoVideoPreviewUrl && promoVideoPreviewUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(promoVideoPreviewUrl);
                        }
                        setPromoVideoMediaId(null);
                        setPromoVideoPreviewUrl(null);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg shadow-md cursor-pointer transition-all"
                      title="Remove Video"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-44 h-24 sm:w-56 sm:h-32 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                    <VideoIcon className="w-7 h-7 mb-1 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold">Promo Video File</span>
                  </div>
                )}

                <div className="space-y-2 min-w-0 flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-blue-600 dark:text-[#60A5FA] hover:bg-blue-100 dark:hover:bg-[rgba(37,99,235,0.20)] rounded-xl text-xs font-bold cursor-pointer transition-all border border-blue-200 dark:border-[rgba(59,130,246,0.25)]">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingPromoVideo ? "Uploading Video..." : "Select Promo Video File"}</span>
                    <input
                      type="file"
                      accept="video/mp4, video/webm, video/ogg"
                      onChange={handlePromoVideoUpload}
                      disabled={isUploadingPromoVideo}
                      className="hidden"
                    />
                  </label>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 font-normal leading-normal">
                    <p>• <strong>Formats:</strong> MP4, WEBM • <strong>Max Size:</strong> 100 MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Promo Video Mode: URL */}
            {promoVideoMode === "URL" && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">External Video URL (YouTube, Vimeo, Direct MP4)</label>
                  <Input
                    type="url"
                    value={customPromoVideoUrl}
                    onChange={(e) => {
                      setCustomPromoVideoUrl(e.target.value);
                      setIsPromoVideoUrlBroken(false);
                    }}
                    placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  />
                </div>

                {customPromoVideoUrl.trim() && (
                  <div className="space-y-2">
                    <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-[#334155] bg-slate-900 shadow-2xs">
                      {customPromoVideoUrl.includes("youtube") || customPromoVideoUrl.includes("vimeo") ? (
                        <iframe
                          src={getEmbedVideoUrl(customPromoVideoUrl.trim())}
                          title="Promo Video Embed Preview"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={customPromoVideoUrl.trim()}
                          controls
                          className="w-full h-full object-cover"
                          onError={() => setIsPromoVideoUrlBroken(true)}
                        />
                      )}
                    </div>
                    {isPromoVideoUrlBroken && (
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> Invalid or unplayable direct video URL (Only Embed URL supported).
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-4 sm:p-6 space-y-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-[#263244] pb-2">
            3. Tuition & Pricing Rules
          </h3>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_free" {...register("is_free")} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            <label htmlFor="is_free" className="text-xs font-medium text-slate-900 dark:text-slate-200 cursor-pointer">
              Mark this course as FREE (Zero tuition fee)
            </label>
          </div>

          {!watchIsFree && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Course Price <span className="text-[#2563EB] dark:text-[#60A5FA]">*</span>
                </label>
                <Input type="number" step="0.01" {...register("price")} name="price" aria-invalid={Boolean(errors.price)} placeholder="2999" />
                {errors.price && <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{errors.price.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">Currency</label>
                <select
                  {...register("currency")}
                  name="currency"
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 rounded-xl text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-hidden cursor-pointer transition-all"
                >
                  <option value="INR" className="dark:bg-[#111827] dark:text-slate-50">INR (₹)</option>
                  <option value="USD" className="dark:bg-[#111827] dark:text-slate-50">USD ($)</option>
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#334155]">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate("/courses")}
            className="dark:bg-[#111827] dark:border-[#334155] dark:text-[#CBD5E1] dark:hover:bg-[#172033] dark:hover:text-white"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting || isUploadingThumbnail || isUploadingPromoVideo}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Course...</span>
              </span>
            ) : courseUuid ? (
              "Update Course"
            ) : (
              "Save Course"
            )}
          </Button>
        </div>
      </form>

      {/* Admin Category Merge Modal */}
      <CategoryMergeModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
      />
    </div>
  );
};
