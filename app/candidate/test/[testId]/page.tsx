"use client";

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InterviewPage from "../../../../src/pages/Interview";

const CANDIDATE_SESSION_KEY = "candidateSession";

export default function CandidateTestPage() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  useEffect(() => {
    const activeSession = localStorage.getItem(CANDIDATE_SESSION_KEY);
    if (!activeSession || !testId || activeSession !== testId) {
      navigate("/candidate/login", { replace: true });
    }
  }, [navigate, testId]);

  return <InterviewPage />;
}