import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, FileText, CheckCircle, ChevronLeft, ChevronRight, Menu, X, Star, HelpCircle, MessageSquare, Send, User } from 'lucide-react';
import api from '../utils/api';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  isFreePreview: boolean;
  orderIndex: number;
  isCompleted: boolean;
  lastWatchedSeconds: number;
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
  }[];
}

interface QuizResult {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
}

const LessonView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState('');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const lastSavedTime = React.useRef<number>(0);

  // Review state
  const [reviews, setReviews] = useState<any[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState(false);

  // Quiz State
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isQuizSubmitting, setIsQuizSubmitting] = useState(false);
  const [isQuizPassed, setIsQuizPassed] = useState(false);

  // Discussion State
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [isDiscussionLoading, setIsDiscussionLoading] = useState(false);

  const fetchContent = async () => {
    try {
      const res = await api.get(`/lessons/course/${courseId}`);
      setLessons(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to access course content.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  // Fetch reviews
  useEffect(() => {
    if (!courseId) return;
    api.get(`/reviews/course/${courseId}`).then(r => setReviews(r.data.data)).catch(() => {});
  }, [courseId]);

  const handleSubmitReview = async () => {
    if (myRating === 0 || !courseId) return;
    setReviewSubmitting(true);
    try {
      await api.post('/reviews', { courseId, rating: myRating, comment: myComment || null });
      // Refresh reviews
      const r = await api.get(`/reviews/course/${courseId}`);
      setReviews(r.data.data);
      setMyComment('');
      setShowReviewPanel(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const currentLesson = lessons[currentLessonIndex];

  // Auto-seek when lesson changes
  useEffect(() => {
    if (currentLesson && videoRef.current) {
      videoRef.current.currentTime = currentLesson.lastWatchedSeconds || 0;
      lastSavedTime.current = currentLesson.lastWatchedSeconds || 0;
    }
    // Fetch quiz for this lesson
    if (currentLesson) {
      setQuizResult(null);
      setQuizAnswers({});
      setIsQuizPassed(false);
      api.get(`/quizzes/lesson/${currentLesson.id}`).then(r => {
        setCurrentQuiz(r.data.data);
      }).catch(() => {});

      // Fetch discussions
      fetchDiscussions(currentLesson.id);
    }
  }, [currentLessonIndex, lessons.length]);

  const fetchDiscussions = async (lessonId: string) => {
    setIsDiscussionLoading(true);
    try {
      const res = await api.get(`/discussions/lesson/${lessonId}`);
      setDiscussions(res.data.data);
    } catch {
      console.error('Failed to load discussions');
    } finally {
      setIsDiscussionLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.trim() || !currentLesson) return;
    try {
      await api.post('/discussions/question', { lessonId: currentLesson.id, content: newQuestion });
      setNewQuestion('');
      fetchDiscussions(currentLesson.id);
    } catch {
      alert('Failed to post question.');
    }
  };

  const handleReply = async (discussionId: string) => {
    if (!newReply.trim()) return;
    try {
      await api.post('/discussions/reply', { discussionId, content: newReply });
      setNewReply('');
      setActiveReplyId(null);
      if (currentLesson) fetchDiscussions(currentLesson.id);
    } catch {
      alert('Failed to post reply.');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    setIsQuizSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${currentQuiz.id}/submit`, { answers: quizAnswers });
      setQuizResult(res.data.data);
      if (res.data.data.passed) setIsQuizPassed(true);
    } catch {
      alert('Failed to submit quiz.');
    } finally {
      setIsQuizSubmitting(false);
    }
  };

  const saveProgress = async (seconds: number) => {
    if (!currentLesson) return;
    try {
      await api.patch(`/lessons/${currentLesson.id}/progress`, { seconds });
      lastSavedTime.current = seconds;
      
      // Update local state without re-fetching everything
      setLessons(prev => prev.map(l => 
        l.id === currentLesson.id ? { ...l, lastWatchedSeconds: seconds } : l
      ));
    } catch {
      console.error('Failed to save playback progress');
    }
  };

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    
    // Save every 10 seconds of playback
    if (Math.abs(currentTime - lastSavedTime.current) > 10) {
      saveProgress(currentTime);
    }
  };

  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    try {
      const res = await api.post(`/lessons/${currentLesson.id}/complete`);
      setLessons(prev => prev.map(l => 
        l.id === currentLesson.id ? { ...l, isCompleted: res.data.isCompleted } : l
      ));
    } catch {
      alert('Failed to update progress.');
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      if (videoRef.current) saveProgress(videoRef.current.currentTime);
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) {
      if (videoRef.current) saveProgress(videoRef.current.currentTime);
      setCurrentLessonIndex(prev => prev - 1);
    }
  };

  if (isLoading) return <div className="auth-page"><span className="loader" /></div>;

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ color: 'var(--accent-glow)' }}>Access Restricted</h2>
          <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>{error}</p>
          <Link to="/courses" className="btn-primary" style={{ display: 'inline-block' }}>Browse Courses</Link>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2>Course is Empty</h2>
          <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>No lessons have been added to this course yet.</p>
          <Link to="/courses" className="btn-primary" style={{ display: 'inline-block' }}>Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-layout">
      {/* Mobile Toggle */}
      <button 
        className="sidebar-toggle-mobile" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`learning-sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Course Content</h3>
        </div>
        <div className="sidebar-lesson-list">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              className={`sidebar-lesson-item ${index === currentLessonIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentLessonIndex(index);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <div className="lesson-status">
                {lesson.isCompleted ? <CheckCircle size={16} color="var(--success)" /> : (lesson.videoUrl ? <Play size={16} /> : <FileText size={16} />)}
              </div>
              <div className="lesson-meta">
                <span className="lesson-index">Lesson {index + 1}</span>
                <span className="lesson-title">{lesson.title}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="learning-main">
        <div className="lesson-viewport">
          {currentLesson?.videoUrl ? (
            <div className="video-container glass-panel">
              <video 
                key={currentLesson.id} 
                ref={videoRef}
                controls 
                controlsList="nodownload"
                className="lesson-video"
                onTimeUpdate={onTimeUpdate}
                onPause={() => videoRef.current && saveProgress(videoRef.current.currentTime)}
              >
                <source src={currentLesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="no-video glass-panel">
              <FileText size={48} color="var(--accent-glow)" />
              <p>This lesson is text-based.</p>
            </div>
          )}

          <div className="lesson-content-body glass-panel">
            <h1 className="lesson-display-title">{currentLesson?.title}</h1>
            <div className="markdown-display">
              {currentLesson?.content || <p className="text-muted">No additional text content for this lesson.</p>}
            </div>
          </div>

          {/* Quiz Section */}
          {currentQuiz && (
            <div className="lesson-content-body glass-panel quiz-section" style={{ borderTop: '4px solid var(--accent-glow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                  <HelpCircle size={24} color="var(--accent-glow)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{currentQuiz.title}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score at least {currentQuiz.passingScore}% to complete this lesson.</p>
                </div>
              </div>

              {!quizResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {currentQuiz.questions.map((q, idx) => (
                    <div key={q.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <p style={{ marginBottom: '1rem', fontWeight: 600 }}>{idx + 1}. {q.text}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.options.map(opt => (
                          <label key={opt.id} className="quiz-option" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', background: quizAnswers[q.id] === opt.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent', border: quizAnswers[q.id] === opt.id ? '1px solid var(--accent-glow)' : '1px solid rgba(255,255,255,0.05)' }}>
                            <input 
                              type="radio" 
                              name={q.id} 
                              checked={quizAnswers[q.id] === opt.id}
                              onChange={() => setQuizAnswers({...quizAnswers, [q.id]: opt.id})}
                              style={{ accentColor: 'var(--accent-glow)' }}
                            />
                            <span style={{ fontSize: '0.9rem' }}>{opt.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button 
                    className="btn-primary" 
                    onClick={handleSubmitQuiz} 
                    disabled={isQuizSubmitting || Object.keys(quizAnswers).length < currentQuiz.questions.length}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {isQuizSubmitting ? <span className="loader" /> : 'Submit Quiz Answers'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: quizResult.passed ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderRadius: '20px', border: `1px solid ${quizResult.passed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: quizResult.passed ? 'var(--success)' : '#ef4444', marginBottom: '0.5rem' }}>
                    {Math.round(quizResult.score)}%
                  </div>
                  <h3 style={{ marginBottom: '1rem' }}>{quizResult.passed ? 'Congratulations! You Passed' : 'Not Quite Enough'}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    You got {quizResult.correctCount} out of {quizResult.totalQuestions} questions correct.
                  </p>
                  {!quizResult.passed && (
                    <button className="btn-secondary" onClick={() => setQuizResult(null)}>Try Again</button>
                  )}
                  {quizResult.passed && (
                    <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={20} /> Assessment Complete
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Review Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showReviewPanel ? '1rem' : 0 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Course Reviews ({reviews.length})</h3>
              <button className="btn-sm btn-manage" onClick={() => setShowReviewPanel(!showReviewPanel)}>
                {showReviewPanel ? 'Close' : 'Write Review'}
              </button>
            </div>

            {showReviewPanel && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star
                      key={s} size={24}
                      fill={(hoverRating || myRating) >= s ? '#fbbf24' : 'transparent'}
                      color={(hoverRating || myRating) >= s ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
                      style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setMyRating(s)}
                    />
                  ))}
                </div>
                <textarea
                  className="premium-textarea"
                  placeholder="Share your experience... (optional)"
                  value={myComment}
                  onChange={e => setMyComment(e.target.value)}
                  style={{ minHeight: '60px', marginBottom: '0.75rem' }}
                />
                <button
                  className="btn-sm btn-enroll"
                  disabled={myRating === 0 || reviewSubmitting}
                  onClick={handleSubmitReview}
                >
                  {reviewSubmitting ? <span className="loader" /> : 'Submit Review'}
                </button>
              </div>
            )}

            {reviews.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.slice(0, 5).map((rev: any) => (
                  <div key={rev.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--surface-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{rev.studentFirstName} {rev.studentLastName}</strong>
                      <div style={{ display: 'flex', gap: '1px' }}>
                        {[1,2,3,4,5].map((s: number) => (
                          <Star key={s} size={12} fill={s <= rev.rating ? '#fbbf24' : 'transparent'} color={s <= rev.rating ? '#fbbf24' : 'rgba(255,255,255,0.15)'} />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discussion Hub (Q&A) */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                <MessageSquare size={20} color="var(--accent-glow)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Lesson Q&A Discussion</h3>
            </div>

            {/* Post Question Form */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <textarea
                  className="premium-textarea"
                  placeholder="Ask a question about this lesson..."
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
                <button 
                  className="btn-primary" 
                  style={{ alignSelf: 'flex-end', padding: '0.75rem' }}
                  onClick={handleCreateQuestion}
                  disabled={!newQuestion.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Question List */}
            {isDiscussionLoading ? (
               <div style={{ textAlign: 'center', padding: '1rem' }}><span className="loader" /></div>
            ) : discussions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                No questions yet. Be the first to start the discussion!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {discussions.map(q => (
                  <div key={q.id} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ padding: '0.5rem', background: 'var(--surface-dark)', borderRadius: '50%', height: 'fit-content' }}>
                        <User size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.user.firstName} {q.user.lastName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(q.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{q.content}</p>
                        
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-glow)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem', padding: 0 }}
                          onClick={() => setActiveReplyId(activeReplyId === q.id ? null : q.id)}
                        >
                          Reply
                        </button>
                      </div>
                    </div>

                    {/* Replies */}
                    {q.replies && q.replies.length > 0 && (
                      <div style={{ marginLeft: '1.5rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {q.replies.map((r: any) => (
                          <div key={r.id} style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ padding: '0.4rem', background: r.user.role === 'INSTRUCTOR' ? 'var(--accent-glow)' : 'var(--surface-dark)', borderRadius: '50%', height: 'fit-content' }}>
                              <User size={12} color={r.user.role === 'INSTRUCTOR' ? '#fff' : 'inherit'} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.15rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.user.firstName} {r.user.lastName}</span>
                                {r.user.role === 'INSTRUCTOR' && <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>Instructor</span>}
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {activeReplyId === q.id && (
                      <div style={{ marginTop: '1rem', marginLeft: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                        <input 
                          className="premium-input" 
                          placeholder="Write a reply..." 
                          value={newReply}
                          onChange={e => setNewReply(e.target.value)}
                          style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                          autoFocus
                        />
                        <button className="btn-sm btn-primary" onClick={() => handleReply(q.id)} disabled={!newReply.trim()}>
                          <Send size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Footer */}
            <div className="learning-navigation">
              <button 
                className="btn-sm btn-manage" 
                onClick={handlePrev} 
                disabled={currentLessonIndex === 0}
              >
                <ChevronLeft size={18} /> Previous
              </button>
              
              <button 
                className={`btn-sm ${currentLesson?.isCompleted ? 'btn-success' : 'btn-primary'}`} 
                onClick={handleToggleComplete}
                disabled={currentQuiz !== null && !isQuizPassed && !currentLesson?.isCompleted}
                style={{ borderRadius: '20px', padding: '0.4rem 1.2rem', opacity: (currentQuiz !== null && !isQuizPassed && !currentLesson?.isCompleted) ? 0.5 : 1 }}
              >
                {currentLesson?.isCompleted ? <><CheckCircle size={16} /> Completed</> : (currentQuiz !== null && !isQuizPassed) ? 'Pass Quiz to Complete' : 'Mark as Completed'}
              </button>

              <button 
                className="btn-sm btn-manage" 
                onClick={handleNext} 
                disabled={currentLessonIndex === lessons.length - 1}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default LessonView;
