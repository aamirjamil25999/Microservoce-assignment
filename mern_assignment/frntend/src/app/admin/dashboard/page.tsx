'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Building2, CheckCircle, Download } from 'lucide-react';

const COURSE_BASE = process.env.NEXT_PUBLIC_COURSE_BASE || 'http://localhost:4002/courses';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('jwt') || '';
}

type UploadCardProps = {
  title: string;
  description: string;
  uploadUrl: string;               // <-- real API endpoint
  onDownloadTemplate?: () => void;
};

function UploadCard({ title, description, uploadUrl, onDownloadTemplate }: UploadCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Content-Type browser par depend karta hai; extension check zyada reliable
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please select a .csv file.',
        });
        setSelectedFile(null);
        event.currentTarget.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ variant: 'destructive', title: 'No file', description: 'Please select a CSV file.' });
      return;
    }
    setIsUploading(true);
    try {
      const fd = new FormData();
      // backend expects field name "file"
      fd.append('file', selectedFile);

      const headers: HeadersInit = {};
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // NOTE: FormData ke saath Content-Type mat set karo; browser boundary set karta hai
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: fd,
        headers,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.msg || 'Upload failed');

      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Success</div>,
        description: data?.msg || `Uploaded & indexed (${selectedFile.name})`,
      });

      // reset
      setSelectedFile(null);
      const fileInput = document.getElementById(`file-upload-${title}`) as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: e?.message || 'Error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              {title === 'Universities' ? <Building2 className="text-accent" /> : <FileText className="text-accent" />}
              {title} Data
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onDownloadTemplate && (
            <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          id={`file-upload-${title}`}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
          className="file:text-primary file:font-semibold"
        />
        {selectedFile && <p className="text-sm text-muted-foreground">Selected file: {selectedFile.name}</p>}
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
          {isUploading ? 'Uploading...' : (<><Upload className="mr-2 h-4 w-4" /> Upload CSV</>)}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { toast } = useToast();

  const handleUniversityTemplateDownload = () => {
    const headers = [
      "University Name","Unique Code","Image URL","Location (City, Country)",
      "Full Address","Established Year","Type","Partner University (Yes/No)",
      "Description","Long Description","Official Website","Email","Contact Number",
      "Application Fee Waived (Yes/No)","US News & World Report","QS Ranking",
      "THE (Times Higher Education)","ARWU (Shanghai Ranking)","Our Ranking",
      "Fields of Study (comma-separated)","Program Offerings (IDs) (comma-separated IDs)",
      "Tuition Fees Min","Tuition Fees Max","Tuition Fees Currency","Tuition Fees Notes",
      "Admission Requirements (use \"\" for multiline)","Campus Life (use \"\" for multiline)"
    ];
    const csvHeader = headers.map(h => `"${h.replace(/"/g,'""')}"`).join(',');
    const blob = new Blob([csvHeader + '\n'], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url; link.download = 'university_template.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCourseTemplateDownload = () => {
    const headers = [
      "Unique ID","Course Name","Course Code","University Code","University Name",
      "Department/School","Discipline/Major","Specialization","Course Level",
      "Overview/Description","Summary","Prerequisites (comma-separated)",
      "Learning Outcomes (comma-separated)","Teaching Methodology",
      "Assessment Methods (comma-separated)","Credits","Duration (Months)",
      "Language of Instruction","Syllabus URL","Keywords (comma-separated)",
      "Professor Name","Professor Email","Office Location","Open for Intake (Year/Semester)",
      "Admission Open Years","Attendance Type","1st Year Tuition Fee","Total Tuition Fee",
      "Tuition Fee Currency","Application Fee Amount","Application Fee Currency",
      "Application Fee Waived (Yes/No)","Required Application Materials",
      "12th Grade Requirement","Undergraduate Degree Requirement","Minimum IELTS Score",
      "Minimum TOEFL Score","Minimum PTE Score","Minimum Duolingo Score",
      "Minimum Cambridge English Score","Other English Tests Accepted","GRE Required (Yes/No)",
      "GRE Score","GMAT Required (Yes/No)","GMAT Score","SAT Required (Yes/No)","SAT Score",
      "ACT Required (Yes/No)","ACT Score","Waiver Options","Partner Course (Yes/No)",
      "FT Ranking 2024","Acceptance Rate","Domestic Application Deadline",
      "International Application Deadline","Course URL"
    ];
    const csvHeader = headers.map(h => `"${h.replace(/"/g,'""')}"`).join(',');
    const blob = new Blob([csvHeader + '\n'], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url; link.download = 'course_template.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="font-headline text-4xl font-bold mb-2 text-primary">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage university and course data from here.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Universities -> currently posting to /courses/upload as backend placeholder */}
        <UploadCard
          title="Universities"
          description="Upload a CSV file with university information."
          uploadUrl={`${COURSE_BASE}/upload`}
          onDownloadTemplate={handleUniversityTemplateDownload}
        />

        {/* Courses -> /courses/upload */}
        <UploadCard
          title="Courses"
          description="Upload a CSV file with course information."
          uploadUrl={`${COURSE_BASE}/upload`}
          onDownloadTemplate={handleCourseTemplateDownload}
        />
      </div>
    </div>
  );
}
