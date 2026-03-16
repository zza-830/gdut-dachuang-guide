// Page Transition Wrapper - Slow Fade In Animation
import React from 'react';

const PageTransition = ({ children }) => {
  return (
    <div className="page-transition-wrapper">
      {children}
    </div>
  );
};

export default PageTransition;
