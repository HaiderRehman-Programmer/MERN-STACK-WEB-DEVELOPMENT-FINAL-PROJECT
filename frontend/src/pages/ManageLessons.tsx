import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Eye, Video, Trash2, FileVideo, CheckCircle, Edit2, HelpCircle, X } from 'lucide-react';
import api from '../utils/api';

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  isFreePreview: boolean;
  orderIndex: number;
}

const ManageLessons: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Quiz state
  const [quizModalLesson, setQuizModalLesson] = useState<Lesson | null>(null);
  const [quizForm, setQuizForm] = useState<{
    id?: string;
    title: string;
    passingScore: number;
    questions: { text: string; options: { text: string; isCorrect: boolean }[] }[];
  }>({ title: '', passingScore: 70, questions: [] });
  const [isQuizSaving, setIsQuizSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    videoUrl: '',
    orderIndex: 0,
    isFreePreview: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLessons = async () => {
    try {
      const res = await api.get(`/lessons/course/${courseId}`);
      setLessons(res.data.data);
    } catch {
      setError('Failed to load lessons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchQuiz = async (lessonId: string) => {
    try {
      const res = await api.get(`/quizzes/lesson/${lessonId}`);
      if (res.data.data) {
        setQuizForm(res.data.data);
      } else {
        setQuizForm({ title: 'Lesson Quiz', passingScore: 70, questions: [{ text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }] });
      }
    } catch {
      setError('Failed to load quiz.');
    }
  };

  const handleOpenQuiz = (lesson: Lesson) => {
    setQuizModalLesson(lesson);
    fetchQuiz(lesson.id);
  };

  const handleSaveQuiz = async () => {
    if (!quizModalLesson) return;
    setIsQuizSaving(true);
    try {
      await api.post('/quizzes', { ...quizForm, lessonId: quizModalLesson.id });
      setSuccess('Quiz saved successfully!');
      setQuizModalLesson(null);
    } catch {
      setError('Failed to save quiz.');
    } finally {
      setIsQuizSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'orderIndex' ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await api.post('/lessons/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
          setUploadProgress(percentCompleted);
        },
      });
      setForm(prev => ({ ...prev, videoUrl: res.data.data.url }));
      if (editingLesson) setEditingLesson(prev => prev ? ({ ...prev, videoUrl: res.data.data.url }) : null);
      setSuccess('Video uploaded successfully!');
    } catch (err: any) {
      setError('Video upload failed. ensure file size is under 50MB.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    setIsSaving(true);

    try {
      await api.patch(`/lessons/${editingLesson.id}`, editingLesson);
      setSuccess('Lesson updated successfully!');
      setEditingLesson(null);
      fetchLessons();
    } catch {
      setError('Failed to update lesson.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      await api.post('/lessons', { ...form, courseId });
      setSuccess('Lesson added successfully!');
      setForm({ title: '', content: '', videoUrl: '', orderIndex: lessons.length + 1, isFreePreview: false });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchLessons();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to create lesson.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) return;

    try {
      await api.delete(`/lessons/${lessonId}`);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      setSuccess('Lesson deleted successfully.');
    } catch (err: any) {
      setError('Failed to delete lesson.');
    }
  };

  return (
    <div className="container">
      <Link to="/instructor" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="page-header">
        <h1>Manage Lessons</h1>
        <p>Add and organize lessons for this course.</p>
      </div>

      {/* Add Lesson Form */}
      <form className="glass-panel inline-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lesson-title">Lesson Title</label>
            <input
              id="lesson-title"
              className="premium-input"
              type="text"
              name="title"
              placeholder="e.g. Introduction to Hooks"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" style={{ maxWidth: '120px' }}>
            <label htmlFor="lesson-order">Order Index</label>
            <input
              id="lesson-order"
              className="premium-input"
              type="number"
              name="orderIndex"
              min="0"
              value={form.orderIndex}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lesson-content">Content (Markdown)</label>
          <textarea
            id="lesson-content"
            className="premium-textarea"
            name="content"
            placeholder="Write lesson content here..."
            value={form.content}
            onChange={handleChange}
            style={{ height: '120px' }}
          />
        </div>

        <div className="form-group">
          <label>Video Lesson (Optional)</label>
          <div className="file-upload-wrapper">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
              id="video-upload"
            />
            <label htmlFor="video-upload" className="file-upload-btn glass-panel">
              {isUploading ? (
                <div style={{ width: '100%' }}>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '5px', display: 'block', textAlign: 'center' }}>
                    Uploading {uploadProgress}%
                  </span>
                </div>
              ) : form.videoUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                  <CheckCircle size={16} /> Video Uploaded
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileVideo size={16} /> Choose Video File
                </div>
              )}
            </label>
            {form.videoUrl && (
              <span className="file-url-preview">URL: {form.videoUrl.split('/').pop()}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-switch ${form.isFreePreview ? 'active' : ''}`}
              onClick={() => setForm(prev => ({ ...prev, isFreePreview: !prev.isFreePreview }))}
              aria-label="Toggle free preview"
            />
            <label style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
              Free Preview (Available without enrollment)
            </label>
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={isSaving || isUploading} style={{ maxWidth: '200px' }}>
          {isSaving ? <span className="loader" /> : <><Plus size={16} /> Add Lesson</>}
        </button>
      </form>

      {/* Lesson List */}
      <h2 className="section-divider">Current Lessons ({lessons.length})</h2>

      {isLoading ? (
        <div className="auth-page"><span className="loader" /></div>
      ) : lessons.length === 0 ? (
        <div className="empty-state">
          <p>No lessons added yet.</p>
        </div>
      ) : (
        <div className="lesson-list">
          {lessons.map(lesson => (
            <div key={lesson.id} className="glass-panel lesson-item">
              <div className="lesson-info">
                <span className="lesson-order">{lesson.orderIndex}</span>
                <span className="lesson-title">{lesson.title}</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {lesson.isFreePreview && <span className="badge badge-info"><Eye size={10} /> Preview</span>}
                  {lesson.videoUrl && <span className="badge badge-success"><Video size={10} /> Video</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleOpenQuiz(lesson)}
                    title="Manage Quiz"
                    style={{ color: 'var(--accent-glow)' }}
                  >
                    <HelpCircle size={16} />
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => setEditingLesson(lesson)}
                    title="Edit Lesson"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(lesson.id)}
                    title="Delete Lesson"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '600px', width: '95%' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Lesson</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Lesson Title</label>
                <input
                  className="premium-input"
                  type="text"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content (Markdown)</label>
                <textarea
                  className="premium-textarea"
                  value={editingLesson.content || ''}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="form-group">
                <label>Video URL / Upload</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    className="premium-input"
                    value={editingLesson.videoUrl || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                    placeholder="Video URL..."
                  />
                  <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="toggle-row">
                  <button
                    type="button"
                    className={`toggle-switch ${editingLesson.isFreePreview ? 'active' : ''}`}
                    onClick={() => setEditingLesson({ ...editingLesson, isFreePreview: !editingLesson.isFreePreview })}
                  />
                  <label style={{ fontSize: '0.85rem' }}>Free Preview</label>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Order Index</label>
                  <input
                    className="premium-input"
                    type="number"
                    value={editingLesson.orderIndex}
                    onChange={(e) => setEditingLesson({ ...editingLesson, orderIndex: parseInt(e.target.value) || 0 })}
                    style={{ width: '80px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingLesson(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                  {isSaving ? <span className="loader" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Editor Modal */}
      {quizModalLesson && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Quiz: {quizModalLesson.title}</h2>
              <button className="btn-delete" onClick={() => setQuizModalLesson(null)}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label>Quiz Title</label>
              <input 
                className="premium-input" 
                value={quizForm.title} 
                onChange={e => setQuizForm({...quizForm, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Passing Score (%)</label>
              <input 
                className="premium-input" 
                type="number" 
                value={quizForm.passingScore} 
                onChange={e => setQuizForm({...quizForm, passingScore: parseInt(e.target.value) || 0})}
                style={{ width: '100px' }}
              />
            </div>

            <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1rem' }}>Questions</h3>
            {quizForm.questions.map((q, qIdx) => (
              <div key={qIdx} className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <input 
                    className="premium-input" 
                    placeholder={`Question ${qIdx + 1}`}
                    value={q.text} 
                    onChange={e => {
                      const newQ = [...quizForm.questions];
                      newQ[qIdx].text = e.target.value;
                      setQuizForm({...quizForm, questions: newQ});
                    }}
                  />
                  <button 
                    className="btn-delete" 
                    onClick={() => {
                      const newQ = quizForm.questions.filter((_, i) => i !== qIdx);
                      setQuizForm({...quizForm, questions: newQ});
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem' }}>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="radio" 
                        name={`correct-${qIdx}`} 
                        checked={opt.isCorrect} 
                        onChange={() => {
                          const newQ = [...quizForm.questions];
                          newQ[qIdx].options = newQ[qIdx].options.map((o, i) => ({...o, isCorrect: i === oIdx}));
                          setQuizForm({...quizForm, questions: newQ});
                        }}
                      />
                      <input 
                        className="premium-input" 
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt.text}
                        onChange={e => {
                          const newQ = [...quizForm.questions];
                          newQ[qIdx].options[oIdx].text = e.target.value;
                          setQuizForm({...quizForm, questions: newQ});
                        }}
                      />
                      <button 
                        className="btn-delete"
                        onClick={() => {
                          const newQ = [...quizForm.questions];
                          newQ[qIdx].options = newQ[qIdx].options.filter((_, i) => i !== oIdx);
                          setQuizForm({...quizForm, questions: newQ});
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    className="btn-sm btn-secondary" 
                    style={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
                    onClick={() => {
                      const newQ = [...quizForm.questions];
                      newQ[qIdx].options.push({ text: '', isCorrect: false });
                      setQuizForm({...quizForm, questions: newQ});
                    }}
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            ))}

            <button 
              className="btn-sm btn-manage" 
              style={{ marginBottom: '2rem' }}
              onClick={() => setQuizForm({...quizForm, questions: [...quizForm.questions, { text: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }]})}
            >
              + Add Question
            </button>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setQuizModalLesson(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveQuiz} disabled={isQuizSaving}>
                {isQuizSaving ? <span className="loader" /> : 'Save Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}


      <style>{`
        .progress-bar-container { background: rgba(255,255,255,0.1); border-radius: 10px; height: 6px; width: 100%; overflow: hidden; margin-top: 5px; }
        .progress-bar { background: var(--accent-glow); height: 100%; transition: width 0.3s ease; }
        .file-upload-btn { border: 1px dashed rgba(255,255,255,0.2); padding: 1rem; border-radius: 8px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.2s; }
        .file-upload-btn:hover { border-color: var(--accent-glow); background: rgba(255,255,255,0.05); }
        .file-url-preview { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem; display: block; overflow: hidden; text-overflow: ellipsis; }
        .btn-delete { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; transition: color 0.2s; padding: 0.4rem; border-radius: 6px; }
        .btn-delete:hover { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); }
        .toggle-row { display: flex; align-items: center; gap: 0.75rem; margin-top: 5px; }
        .toggle-switch { width: 40px; height: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; position: relative; cursor: pointer; border: none; transition: 0.3s; padding: 0; }
        .toggle-switch.active { background: var(--accent-glow); }
        .toggle-switch::after { content: ''; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: 0.3s; }
        .toggle-switch.active::after { transform: translateX(20px); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
        .modal-content { padding: 2.5rem; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      `}</style>
    </div>
  );
};

export default ManageLessons;
