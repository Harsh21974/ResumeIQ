import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Briefcase,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Eye,
  Clock,
  Brain,
  Rocket,
  Coffee,
  Lightbulb,
} from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState(1);
  const [processingStatus, setProcessingStatus] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [funFacts, setFunFacts] = useState([
    "Did you know? ATS systems reject 75% of resumes before they reach human eyes.",
    "Pro tip: Use standard section headings like 'Experience' and 'Education' for better ATS parsing.",
    "Fun fact: The average recruiter spends only 6-7 seconds reviewing a resume.",
    "Did you know? Including relevant keywords can increase your interview chances by 40%.",
    "Pro tip: Keep your resume format simple - no tables, columns, or graphics for better ATS compatibility.",
    "Fun fact: 85% of resumes are filtered out by ATS before they're seen by a recruiter.",
    "Did you know? Action verbs like 'achieved', 'implemented', and 'developed' score higher in ATS.",
    "Pro tip: Customize your resume for each job application to match specific keywords.",
  ]);
  const [currentFact, setCurrentFact] = useState('');
  const [encouragementMessages, setEncouragementMessages] = useState([
    "We're crafting a detailed analysis just for you...",
    "Our AI is carefully evaluating every section of your resume...",
    "Almost there! We're making sure every detail is perfect...",
    "Hang tight! We're building your personalized improvement roadmap...",
    "Great things take time! We're ensuring the most accurate analysis...",
    "The AI is working its magic on your resume...",
    "We're mining deep insights from your experience...",
    "Your resume is getting the VIP treatment...",
  ]);
  const [currentEncouragement, setCurrentEncouragement] = useState('');
  const timerRef = useRef(null);
  const factIntervalRef = useRef(null);
  const encouragementIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Processing steps configuration with realistic timing
  const processingStepsConfig = [
    { 
      id: 1, 
      label: 'Extracting resume data', 
      progress: 15, 
      duration: 2000,
      detail: 'Reading your PDF and extracting text...'
    },
    { 
      id: 2, 
      label: 'Parsing content structure', 
      progress: 30, 
      duration: 1800,
      detail: 'Identifying sections, skills, and experience...'
    },
    { 
      id: 3, 
      label: 'Analyzing ATS compatibility', 
      progress: 50, 
      duration: 2500,
      detail: 'Checking against ATS algorithms and industry standards...'
    },
    { 
      id: 4, 
      label: 'Identifying improvements', 
      progress: 70, 
      duration: 2200,
      detail: 'Finding gaps and suggesting enhancements...'
    },
    { 
      id: 5, 
      label: 'Generating roadmap', 
      progress: 88, 
      duration: 2000,
      detail: 'Creating your personalized interview roadmap...'
    },
    { 
      id: 6, 
      label: 'Finalizing results', 
      progress: 100, 
      duration: 1500,
      detail: 'Preparing your comprehensive analysis...'
    },
  ];

  const [processingSteps, setProcessingSteps] = useState(
    processingStepsConfig.map((s, index) => ({
      ...s,
      done: false,
      active: index === 0,
      detail: s.detail,
    }))
  );

  // Popular job titles for quick selection
  const popularJobs = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Product Manager',
    'UX/UI Designer',
    'DevOps Engineer',
    'Machine Learning Engineer',
    'Cloud Architect',
  ];

  // Get random fun fact
  const getRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    return funFacts[randomIndex];
  };

  // Get random encouragement message
  const getRandomEncouragement = () => {
    const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
    return encouragementMessages[randomIndex];
  };

  // Start encouragement and facts rotation
  const startEngagementFeatures = () => {
    // Initial messages
    setCurrentFact(getRandomFact());
    setCurrentEncouragement(getRandomEncouragement());

    // Rotate facts every 8 seconds
    factIntervalRef.current = setInterval(() => {
      setCurrentFact(getRandomFact());
    }, 8000);

    // Rotate encouragement every 5 seconds
    encouragementIntervalRef.current = setInterval(() => {
      setCurrentEncouragement(getRandomEncouragement());
    }, 5000);

    // Show encouragement message after 10 seconds
    setTimeout(() => {
      setShowEncouragement(true);
    }, 10000);
  };

  // Start timer for elapsed time
  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
      
      // After 30 seconds, show a special message
      if (elapsed >= 30 && elapsed < 35) {
        toast.info("We're making the best analysis for your resume. Thanks for your patience! 🚀", {
          duration: 5000,
          icon: <Rocket className="text-blue-500" />,
        });
      }
      
      // After 45 seconds, show another message
      if (elapsed >= 45 && elapsed < 50) {
        toast.info("Good things take time! Our AI is being extra thorough with your resume. ☕", {
          duration: 5000,
          icon: <Coffee className="text-orange-500" />,
        });
      }
    }, 1000);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  }, []);

  const validateAndSetFile = (file) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(file);
    toast.success(`File "${file.name}" uploaded successfully!`);
    setStep(2);
  };

  const removeFile = () => {
    setFile(null);
    setStep(1);
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (factIntervalRef.current) clearInterval(factIntervalRef.current);
      if (encouragementIntervalRef.current) clearInterval(encouragementIntervalRef.current);
    };
  }, []);

  // Update progress with realistic timing
  const updateProgressRealistic = () => {
    let currentStepIndex = 0;
    
    const processNextStep = () => {
      if (currentStepIndex >= processingStepsConfig.length) {
        // All steps complete
        setUploadProgress(100);
        setProcessingStatus('Analysis complete!');
        setProcessingSteps(prev => prev.map(s => ({ ...s, done: true, active: false })));
        
        // Show completion toast with confetti effect
        toast.success('🎉 Analysis complete! Your resume has been thoroughly analyzed.', {
          duration: 4000,
        });
        
        setTimeout(() => {
          const storedData = localStorage.getItem('resumeData');
          if (storedData) {
            navigate('/analysis');
          }
        }, 1500);
        return;
      }

      const step = processingStepsConfig[currentStepIndex];
      
      // Update active step
      setProcessingSteps(prev => prev.map((s, i) => ({
        ...s,
        active: i === currentStepIndex,
        done: i < currentStepIndex,
        detail: i === currentStepIndex ? step.detail : s.detail,
      })));

      // Update progress
      setUploadProgress(step.progress);
      setProcessingStatus(step.detail);

      // Randomize timing slightly for realism (80-120% of base duration)
      const timingVariation = 0.8 + Math.random() * 0.4;
      const duration = step.duration * timingVariation;

      // Special messages at certain progress points
      if (step.progress === 50) {
        toast.info("Analyzing your resume against industry standards...", { duration: 2000 });
      } else if (step.progress === 70) {
        toast.info("Found some interesting insights! Preparing suggestions...", { duration: 2000 });
      }

      currentStepIndex++;
      setTimeout(processNextStep, duration);
    };

    // Start processing
    setTimeout(processNextStep, 500);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!jobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    setIsUploading(true);
    setStep(3);
    setUploadProgress(0);
    setProcessingStatus('Initializing analysis...');
    setElapsedTime(0);
    setShowEncouragement(false);

    // Reset processing steps
    setProcessingSteps(processingStepsConfig.map((s, index) => ({
      ...s,
      done: false,
      active: index === 0,
      detail: s.detail,
    })));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_title', jobTitle);

    // Start engagement features
    startEngagementFeatures();
    startTimer();

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Simulate realistic progress (since we're not using SSE for now)
      localStorage.setItem('resumeData', JSON.stringify(data));
      updateProgressRealistic();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to analyze resume. Please try again.');
      setIsUploading(false);
      setStep(2);
      setProcessingSteps(prev => prev.map(s => ({ ...s, active: false, done: false })));
      
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (factIntervalRef.current) clearInterval(factIntervalRef.current);
      if (encouragementIntervalRef.current) clearInterval(encouragementIntervalRef.current);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FileText size={48} />;
    if (file.type === 'application/pdf') {
      return <FileText size={48} className="text-red-500" />;
    }
    return <FileText size={48} className="text-blue-500" />;
  };

  const getFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 pt-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
          <Sparkles size={16} />
          AI-Powered Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Upload Your Resume
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get instant AI-powered analysis, ATS score, and personalized improvement suggestions
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    step >= s
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step > s ? <CheckCircle size={20} /> : s}
                </div>
                <span className={`hidden sm:inline text-sm font-medium ${
                  step >= s ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {s === 1 ? 'Upload' : s === 2 ? 'Details' : 'Processing'}
                </span>
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${
                  step > s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Upload */}
        {step === 1 && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }
                ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
              `}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx"
              />

              <div className="space-y-4">
                {!file ? (
                  <>
                    <div className="flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                        <UploadCloud size={40} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Drop your resume here
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        or click to browse files
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        📄 PDF
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        📝 DOC
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        📄 DOCX
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        ⬆️ Max 10MB
                      </span>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon()}
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => file && setStep(2)}
                disabled={!file}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300
                  ${file
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Job Details */}
        {step === 2 && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* File Preview Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon()}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {file?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file && getFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setStep(1); removeFile(); }}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Job Title Input */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={20} className="text-blue-500" />
                  Job Title
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mt-1">
                  Enter the job title you're targeting for accurate analysis
                </span>
              </label>

              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Developer"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />

              {/* Popular Job Titles */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Popular choices:
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularJobs.map((job) => (
                    <button
                      key={job}
                      onClick={() => setJobTitle(job)}
                      className={`
                        px-3 py-1.5 text-sm rounded-full transition-all duration-200
                        ${jobTitle === job
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {job}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!jobTitle.trim()}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300
                  ${jobTitle.trim()
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <Sparkles size={20} />
                Analyze Resume
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-12 text-center"
          >
            <div className="space-y-8">
              {/* Animated Icon */}
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
                  {uploadProgress < 100 ? (
                    <Loader2 size={48} className="text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <CheckCircle size={48} className="text-green-500" />
                  )}
                </div>
                {uploadProgress < 100 && uploadProgress > 0 && (
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                    <Zap size={16} className="text-white" />
                  </div>
                )}
                {/* Elapsed time badge */}
                {uploadProgress < 100 && uploadProgress > 0 && (
                  <div className="absolute -bottom-2 -left-2 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(elapsedTime)}
                  </div>
                )}
              </div>

              {/* Status Text */}
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {uploadProgress < 100 ? 'Analyzing Your Resume' : 'Analysis Complete!'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 min-h-[24px] transition-all duration-300">
                  {processingStatus || (uploadProgress < 100
                    ? 'Our AI is carefully analyzing your resume against industry standards'
                    : 'Your resume has been analyzed successfully!'
                  )}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span className="flex items-center gap-2">
                    <Brain size={16} className="text-blue-500" />
                    Processing
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full relative"
                  >
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Encouragement Message - Appears after 10 seconds */}
              {showEncouragement && uploadProgress < 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-md mx-auto p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 justify-center">
                    <Sparkles size={16} className="text-blue-500" />
                    {currentEncouragement}
                  </p>
                </motion.div>
              )}

              {/* Fun Fact - Appears after 15 seconds */}
              {uploadProgress > 30 && uploadProgress < 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-md mx-auto p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800"
                >
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-2 justify-center">
                    <Lightbulb size={14} className="text-yellow-500" />
                    <span className="italic">{currentFact}</span>
                  </p>
                </motion.div>
              )}

              {/* Processing Steps */}
              <div className="max-w-md mx-auto space-y-3 text-left">
                {processingSteps.map((step) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.id * 0.1 }}
                    className="flex items-center gap-3 group"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      step.done
                        ? 'bg-green-500 text-white'
                        : step.active
                        ? 'bg-blue-500 text-white animate-pulse'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}>
                      {step.done ? (
                        <CheckCircle size={14} />
                      ) : step.active ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <span className="text-xs">{step.id}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm transition-colors duration-300 ${
                        step.done
                          ? 'text-gray-900 dark:text-white'
                          : step.active
                          ? 'text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {step.label}
                        {step.active && '...'}
                      </p>
                      {step.active && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-gray-400 dark:text-gray-500 mt-0.5"
                        >
                          {step.detail}
                        </motion.p>
                      )}
                    </div>
                    {step.done && (
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Completion Message */}
              {uploadProgress === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle size={20} />
                    <span className="font-semibold">Redirecting to results...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            icon: Award,
            title: 'ATS Score',
            description: 'Get your resume compatibility score',
          },
          {
            icon: TrendingUp,
            title: 'Improvements',
            description: 'Actionable suggestions to enhance your resume',
          },
          {
            icon: Eye,
            title: 'Interview Roadmap',
            description: 'Personalized preparation roadmap',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
              <feature.icon size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                {feature.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Add shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Upload;