import React from 'react';

interface LoaderProps {
  size?: number;
  center?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size, center }) => {
  const loader = <span className="loader" style={size ? { width: `${size}px`, height: `${size}px` } : {}} />;
  
  if (center) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
