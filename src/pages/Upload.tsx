import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import Navbar from "@/components/ui/Navbar";
import Container from "@/components/ui/Container";
import ResumeUploader from "@/components/ResumeUploader";
import { Upload as UploadIcon } from "lucide-react";

const Upload = () => {
  return (
    <AppLayout>
      <Navbar title="Resume Upload" />
      <div className="fixed inset-0 dot-bg pointer-events-none opacity-20" />

      <Container className="pt-24 pb-16 relative z-10" size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-mono text-primary uppercase tracking-widest mb-3 block"
            >
              Upload & Preview
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              Upload Your Resume
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload your resume and see the extracted content
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl glass border-glow"
          >
            <div className="flex items-center gap-3 mb-8">
              <UploadIcon className="text-primary" size={24} />
              <h2 className="text-xl font-bold">Resume Upload & Extract</h2>
            </div>

            {/* Main Content */}
            <ResumeUploader />

            {/* Info Section */}
            <div className="mt-12 pt-8 border-t border-border space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Supported Formats */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Supported formats:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      PDF (.pdf) - Up to 5MB
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Word (.docx) - Up to 5MB
                    </li>
                  </ul>
                </div>

                {/* How It Works */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">How it works:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>Upload your resume file</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>Content is automatically extracted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>Preview the text and copy it</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  ℹ️ Your resume content will be extracted and displayed for preview. You can copy the text for use in other applications.
                </p>
              </div>
            </div>
          </motion.div>
      </Container>
    </AppLayout>
  );
};

export default Upload;
