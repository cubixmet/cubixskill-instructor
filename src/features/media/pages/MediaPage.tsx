import React, { useState } from 'react';
import {
  Layers,
  Upload,
  Search,
  Trash2,
  FileVideo,
  FileAudio,
  FileText,
  Image as ImageIcon,
  FileCode,
  Download,
  Plus,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { usePlatformStore } from '../../../store/usePlatformStore';

export const MediaPage: React.FC = () => {
  const mediaAssets = usePlatformStore((state) => state.mediaAssets || []);
  const totalCredits = usePlatformStore((state) => state.totalCredits);
  const uploadMediaAsset = usePlatformStore((state) => state.uploadMediaAsset);
  const deleteMediaAsset = usePlatformStore((state) => state.deleteMediaAsset);

  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form State
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('15.4');
  const [fileFormat, setFileFormat] = useState('MP4');
  const [folderName, setFolderName] = useState('Videos');

  const filteredAssets = mediaAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.format.toLowerCase().includes(search.toLowerCase());
    const matchesFolder =
      selectedFolder === 'All' || asset.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const getFormatIcon = (format: string) => {
    const f = format.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(f))
      return <FileVideo className="w-5 h-5 text-blue-600" />;
    if (['mp3', 'wav', 'aac', 'm4a'].includes(f))
      return <FileAudio className="w-5 h-5 text-indigo-600" />;
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(f))
      return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    if (['pdf', 'doc', 'docx'].includes(f))
      return <FileText className="w-5 h-5 text-amber-600" />;
    return <FileCode className="w-5 h-5 text-slate-600" />;
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    uploadMediaAsset({
      name: fileName,
      sizeMb: parseFloat(fileSize) || 10,
      format: fileFormat,
      folder: folderName,
    });

    setFileName('');
    setIsUploadOpen(false);
  };

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      {/* Header */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Media & CDN Library</h1>
              <Badge variant="info" size="sm" className="font-bold">
                {mediaAssets.length} Assets
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage course video lectures, audio recordings, documents, and assets hosted on CubixSkill High-Speed CDN.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="h-9 bg-[#2563EB] text-white font-extrabold text-xs px-4"
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Media Asset
          </Button>
        </div>
      </Card>

      {/* Credit Notice Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <HardDrive className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-blue-950">Media Credit Billing Engine Active</h4>
          <p className="text-blue-800 font-normal leading-relaxed">
            Media upload & CDN streaming operates purely on media credits. No fixed storage quotas or hard limits apply. Your current wallet balance is <strong className="font-bold text-blue-900">{totalCredits} Credits</strong>.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 p-4 rounded-xl shadow-2xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search media files by title or format..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Videos', 'Audio', 'Documents', 'Images'].map((folder) => (
            <button
              key={folder}
              type="button"
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFolder === folder
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.id}
              padding="md"
              className="bg-white border border-slate-200/90 space-y-3 font-sans text-xs hover:border-blue-300 transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl shrink-0">
                    {getFormatIcon(asset.format)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate" title={asset.name}>
                      {asset.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mt-0.5">
                      <span className="uppercase font-bold text-slate-600">{asset.format}</span>
                      <span>•</span>
                      <span>{asset.sizeMb} MB</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteMediaAsset(asset.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                  title="Delete Asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                  {asset.folder || 'Videos'}
                </span>
                <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="lg" className="bg-white border border-slate-200 text-center py-12 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Media Assets Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload videos, audio files, PDFs, or course images to host them securely on CubixSkill CDN.
          </p>
          <Button size="sm" onClick={() => setIsUploadOpen(true)} className="bg-blue-600 text-white font-bold">
            Upload First Asset
          </Button>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Media Asset to CDN"
        subtitle="Specify asset details to upload to your instructor media vault."
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 font-sans text-xs text-left">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Asset Name</label>
            <Input
              placeholder="e.g. React19_Module3_Lecture1.mp4"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Format</label>
              <select
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-bold"
              >
                <option value="MP4">MP4 Video</option>
                <option value="MP3">MP3 Audio</option>
                <option value="PDF">PDF Document</option>
                <option value="PNG">PNG Image</option>
                <option value="ZIP">ZIP Archive</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Size (MB)</label>
              <Input
                type="number"
                step="0.1"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">Category Folder</label>
              <select
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 bg-white text-slate-900 font-bold"
              >
                <option value="Videos">Videos</option>
                <option value="Audio">Audio</option>
                <option value="Documents">Documents</option>
                <option value="Images">Images</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Media credits will be deducted based on total asset size after upload.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white font-bold px-6">
              Confirm &amp; Upload
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
