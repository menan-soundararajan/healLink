import React from 'react';

/**
 * Sri Lankan Avatar Component
 * Provides gender-specific avatars that represent Sri Lankan people
 */
const SriLankanAvatar = ({ gender, size = 60, className = '' }) => {
  const genderUpper = gender ? gender.toUpperCase() : '';
  
  // Default size styles
  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  // Male Avatar - Sri Lankan appearance
  if (genderUpper === 'M' || genderUpper === 'MALE') {
    return (
      <svg
        viewBox="0 0 100 100"
        style={sizeStyle}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Face - South Asian skin tone */}
        <circle cx="50" cy="50" r="45" fill="#C89664" stroke="#B8865A" strokeWidth="1.5"/>
        
        {/* Hair - dark brown/black, typical South Asian hair */}
        <path d="M 18 22 Q 15 12, 25 10 Q 35 8, 45 12 Q 50 10, 55 12 Q 65 8, 75 10 Q 85 12, 82 22 Q 82 28, 78 32 Q 75 35, 70 32 Q 65 30, 60 28 Q 55 30, 50 28 Q 45 30, 40 28 Q 35 30, 30 32 Q 25 35, 22 32 Q 18 28, 18 22 Z" fill="#1a1a1a"/>
        <path d="M 22 32 Q 25 40, 30 45 Q 35 50, 40 48 Q 45 46, 50 48 Q 55 46, 60 48 Q 65 50, 70 45 Q 75 40, 78 32" fill="#1a1a1a"/>
        
        {/* Eyes - dark, almond-shaped */}
        <ellipse cx="38" cy="45" rx="5" ry="6" fill="#0a0a0a"/>
        <ellipse cx="62" cy="45" rx="5" ry="6" fill="#0a0a0a"/>
        <ellipse cx="40" cy="46" rx="2" ry="2.5" fill="#ffffff" opacity="0.8"/>
        <ellipse cx="64" cy="46" rx="2" ry="2.5" fill="#ffffff" opacity="0.8"/>
        
        {/* Eyebrows */}
        <path d="M 32 38 Q 38 36, 44 38" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 56 38 Q 62 36, 68 38" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        
        {/* Nose */}
        <path d="M 50 52 Q 48 58, 50 60 Q 52 58, 50 52" stroke="#B8865A" strokeWidth="1.5" fill="none"/>
        <ellipse cx="50" cy="58" rx="2" ry="1.5" fill="#B8865A" opacity="0.4"/>
        
        {/* Mouth */}
        <path d="M 44 68 Q 50 71, 56 68" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }
  
  // Female Avatar - Sri Lankan appearance
  if (genderUpper === 'F' || genderUpper === 'FEMALE') {
    return (
      <svg
        viewBox="0 0 100 100"
        style={sizeStyle}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Face - South Asian skin tone */}
        <circle cx="50" cy="50" r="45" fill="#C89664" stroke="#B8865A" strokeWidth="1.5"/>
        
        {/* Hair - long, dark, traditional South Asian style */}
        <path d="M 22 18 Q 18 10, 28 8 Q 38 6, 48 10 Q 50 8, 52 10 Q 62 6, 72 8 Q 82 10, 78 18 Q 78 22, 75 26 Q 72 30, 68 28 Q 65 26, 62 24 Q 58 26, 55 24 Q 52 26, 48 24 Q 45 26, 42 24 Q 38 26, 35 28 Q 32 30, 28 26 Q 25 22, 22 18 Z" fill="#1a1a1a"/>
        {/* Long hair flowing down */}
        <path d="M 28 26 Q 30 35, 28 45 Q 26 55, 25 65 Q 24 75, 22 85 Q 20 90, 25 90 Q 30 90, 35 88 Q 40 86, 45 84 Q 50 82, 55 84 Q 60 86, 65 88 Q 70 90, 75 90 Q 80 90, 78 85 Q 76 75, 75 65 Q 74 55, 72 45 Q 70 35, 72 26" fill="#1a1a1a"/>
        <path d="M 25 65 Q 30 70, 35 72 Q 40 74, 45 72 Q 50 70, 55 72 Q 60 74, 65 72 Q 70 70, 75 65" fill="#1a1a1a" opacity="0.8"/>
        
        {/* Eyes - dark, expressive */}
        <ellipse cx="38" cy="45" rx="5" ry="6" fill="#0a0a0a"/>
        <ellipse cx="62" cy="45" rx="5" ry="6" fill="#0a0a0a"/>
        <ellipse cx="40" cy="46" rx="2" ry="2.5" fill="#ffffff" opacity="0.8"/>
        <ellipse cx="64" cy="46" rx="2" ry="2.5" fill="#ffffff" opacity="0.8"/>
        
        {/* Eyebrows - more arched for female */}
        <path d="M 32 37 Q 38 34, 44 37" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M 56 37 Q 62 34, 68 37" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        
        {/* Nose - delicate */}
        <path d="M 50 52 Q 48 57, 50 59 Q 52 57, 50 52" stroke="#B8865A" strokeWidth="1" fill="none"/>
        <ellipse cx="50" cy="58" rx="1.5" ry="1.2" fill="#B8865A" opacity="0.4"/>
        
        {/* Mouth - smaller, more delicate */}
        <path d="M 45 67 Q 50 69, 55 67" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }
  
  // Default/Unspecified Avatar - neutral appearance with South Asian features
  return (
    <svg
      viewBox="0 0 100 100"
      style={sizeStyle}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Face - South Asian skin tone */}
      <circle cx="50" cy="50" r="45" fill="#C89664" stroke="#B8865A" strokeWidth="1.5"/>
      
      {/* Simple hair - dark */}
      <ellipse cx="50" cy="28" rx="38" ry="22" fill="#1a1a1a"/>
      
      {/* Eyes - dark, almond-shaped */}
      <ellipse cx="38" cy="45" rx="5" ry="6" fill="#0a0a0a"/>
      <ellipse cx="62" cy="45" rx="5" ry="6" fill="#0a0a0a"/>
      <ellipse cx="40" cy="46" rx="2" ry="2.5" fill="#ffffff" opacity="0.8"/>
      <ellipse cx="64" cy="46" rx="2" ry="2.5" fill="#ffffff" opacity="0.8"/>
      
      {/* Eyebrows */}
      <path d="M 32 38 Q 38 36, 44 38" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 56 38 Q 62 36, 68 38" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Nose */}
      <path d="M 50 52 Q 48 58, 50 60 Q 52 58, 50 52" stroke="#B8865A" strokeWidth="1.5" fill="none"/>
      <ellipse cx="50" cy="58" rx="2" ry="1.5" fill="#B8865A" opacity="0.4"/>
      
      {/* Mouth */}
      <path d="M 44 68 Q 50 71, 56 68" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
};

export default SriLankanAvatar;

