"use client";

import { FormEvent, useState } from "react";

export interface CandidateRecord {
  testId: string;
  email: string;
  password: string;
  resumeFileName: string;
  status: "pending";
}

interface ResumeUploaderProps {
  onGenerateCandidateAccess: (payload: { resumeFile: File | null; candidateEmail: string }) => void;
}

export default function ResumeUploader({ onGenerateCandidateAccess }: ResumeUploaderProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [candidateEmail, setCandidateEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onGenerateCandidateAccess({ resumeFile, candidateEmail: candidateEmail.trim().toLowerCase() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="resume-upload" className="mb-2 block text-sm font-medium text-slate-700">
          Resume Upload (PDF)
        </label>
        <input
          id="resume-upload"
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            const selectedFile = event.target.files?.[0] ?? null;
            setResumeFile(selectedFile);
          }}
          className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
          required
        />
        {resumeFile && <p className="mt-2 text-xs text-slate-500">Selected: {resumeFile.name}</p>}
      </div>

      <div>
        <label htmlFor="candidate-email" className="mb-2 block text-sm font-medium text-slate-700">
          Candidate Email
        </label>
        <input
          id="candidate-email"
          type="email"
          value={candidateEmail}
          onChange={(event) => setCandidateEmail(event.target.value)}
          placeholder="candidate@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Generate Candidate Access
      </button>
    </form>
  );
}