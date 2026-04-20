import React from 'react';
import { motion } from 'framer-motion';
import Magnetic from './Magnetic';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'manage' | 'enroll' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isMagnetic?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  isMagnetic = false,
  className = '', 
  disabled, 
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary': return 'btn-secondary';
      case 'manage': return 'btn-manage';
      case 'enroll': return 'btn-enroll';
      case 'danger': return 'btn-sm';
      default: return 'btn-primary';
    }
  };

  const getSizeStyle = () => {
    if (size === 'sm' || variant === 'manage' || variant === 'enroll') return 'btn-sm';
    return '';
  };

  const dangerStyle = variant === 'danger' ? { background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b' } : {};

  const content = (
    <motion.button 
      className={`${getVariantClass()} ${getSizeStyle()} ${className}`} 
      disabled={disabled || isLoading}
      style={{ ...dangerStyle, ...(props.style || {}) }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props as any}
    >
      {isLoading ? <span className="loader" style={{ width: '16px', height: '16px' }} /> : children}
    </motion.button>
  );

  if (isMagnetic) {
    return <Magnetic>{content}</Magnetic>;
  }

  return content;
};

export default Button;
