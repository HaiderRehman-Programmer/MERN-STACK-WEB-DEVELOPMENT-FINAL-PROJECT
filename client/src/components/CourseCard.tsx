import React from 'react';
import { Star, Globe, Lock } from 'lucide-react';
import GlassPanel from './ui/GlassPanel';
import Badge from './ui/Badge';

interface Course {
  id: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  instructor?: { firstName: string; lastName: string };
  avgRating?: number;
  reviewCount?: number;
  isPublished?: boolean;
}

interface CourseCardProps {
  course: Course;
  footerContent?: React.ReactNode;
  showInstructor?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  footerContent, 
  showInstructor = true,
  className = '',
  style
}) => {
  return (
    <GlassPanel 
      className={`course-card ${course.isPublished === false ? 'draft' : ''} ${className}`}
      style={style}
    >
      <div className="course-card-badges" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {course.isPublished !== undefined && (
          course.isPublished ? (
            <Badge variant="success"><Globe size={10} /> Published</Badge>
          ) : (
            <Badge variant="warning"><Lock size={10} /> Draft</Badge>
          )
        )}
        {course.category && (
          <Badge variant="info">{course.category}</Badge>
        )}
      </div>

      <span className="course-title" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{course.title}</span>
      
      {showInstructor && course.instructor && (
        <span className="course-instructor" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          by {course.instructor.firstName} {course.instructor.lastName}
        </span>
      )}

      {(course.reviewCount || 0) > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', gap: '1px' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <Star 
                key={s} 
                size={12} 
                fill={s <= Math.round(course.avgRating || 0) ? '#fbbf24' : 'transparent'} 
                color={s <= Math.round(course.avgRating || 0) ? '#fbbf24' : 'rgba(255,255,255,0.2)'} 
              />
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {course.avgRating} ({course.reviewCount})
          </span>
        </div>
      )}

      <p className="course-description" style={{ 
        fontSize: '0.88rem', 
        color: 'var(--text-muted)', 
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        margin: '0.5rem 0'
      }}>
        {course.description}
      </p>

      <div className="course-footer" style={{ 
        marginTop: 'auto', 
        paddingTop: '0.75rem', 
        borderTop: '1px solid var(--surface-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span className={`price-tag ${course.price === 0 ? 'free' : ''}`} style={{ fontWeight: 800 }}>
          {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
        </span>
        {footerContent}
      </div>
    </GlassPanel>
  );
};

export default CourseCard;
