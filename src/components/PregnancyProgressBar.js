import React from 'react';

const PregnancyProgressBar = ({ gestationalAge, lmpDate, eddDate }) => {
  // If no gestational age data, show fallback message
  if (!gestationalAge && !lmpDate) {
    return (
      <div className="text-muted">
        <small>Pregnancy data not available</small>
      </div>
    );
  }

  // Calculate gestational age in weeks (0-40)
  const weeks = gestationalAge || 0;
  const progressPercentage = Math.min((weeks / 40) * 100, 100);

  // Get milestone image based on gestational age
  const getMilestoneImage = (weeks) => {
    if (weeks < 4) return '🌱'; // Early embryo
    if (weeks < 8) return '🌿'; // Embryo development
    if (weeks < 12) return '👤'; // Fetus formation
    if (weeks < 16) return '🤰'; // Growing fetus
    if (weeks < 20) return '👶'; // Anatomy scan period
    if (weeks < 24) return '👼'; // Viability milestone
    if (weeks < 28) return '👶'; // Third trimester start
    if (weeks < 32) return '🤱'; // Rapid growth
    if (weeks < 36) return '👶'; // Near term
    return '👶'; // Full term
  };

  // Get milestone description
  const getMilestoneDescription = (weeks) => {
    if (weeks < 4) return 'Early development';
    if (weeks < 8) return 'Embryo forming';
    if (weeks < 12) return 'Fetus developing';
    if (weeks < 16) return 'Growing rapidly';
    if (weeks < 20) return 'Anatomy scan';
    if (weeks < 24) return 'Viability milestone';
    if (weeks < 28) return 'Third trimester';
    if (weeks < 32) return 'Rapid growth';
    if (weeks < 36) return 'Near term';
    return 'Full term';
  };

  const milestoneIcon = getMilestoneImage(weeks);
  const milestoneDesc = getMilestoneDescription(weeks);

  // Key milestone weeks to display above the progress bar
  const milestoneWeeks = [4, 8, 12, 20, 28, 36, 40];
  
  // Get milestone icon for a specific week
  const getMilestoneForWeek = (weekNum) => {
    return getMilestoneImage(weekNum);
  };

  // Create 40 segments for the progress bar
  const totalWeeks = 40;
  const segments = Array.from({ length: totalWeeks }, (_, index) => {
    const weekNumber = index + 1;
    let segmentColor;
    let segmentClass = '';
    
    if (weekNumber < weeks) {
      // Past weeks - filled/primary color
      segmentColor = '#28a745'; // Green/success color
      segmentClass = 'past-week';
    } else if (weekNumber === weeks) {
      // Current week - highlighted color
      segmentColor = '#ffc107'; // Yellow/warning color for highlight
      segmentClass = 'current-week';
    } else {
      // Future weeks - neutral/light color
      segmentColor = '#e9ecef'; // Light gray
      segmentClass = 'future-week';
    }
    
    return {
      weekNumber,
      color: segmentColor,
      class: segmentClass
    };
  });

  // Calculate position percentage for a given week (0-100%)
  const getWeekPosition = (weekNum) => {
    return ((weekNum - 1) / 40) * 100;
  };

  return (
    <div className="d-flex flex-column align-items-start" style={{ width: '100%' }}>
      {/* Progress Bar Container */}
      <div className="w-100 mb-2" style={{ position: 'relative' }}>
        {/* Header with week info */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <small className="text-muted fw-bold">Week {weeks} of 40</small>
          <small className="text-muted">{milestoneIcon} {milestoneDesc}</small>
        </div>

        {/* Milestone Images Above Progress Bar */}
        <div 
          className="d-flex justify-content-between align-items-center mb-1"
          style={{ 
            width: '100%',
            position: 'relative',
            height: '30px',
            padding: '0 1%'
          }}
        >
          {milestoneWeeks.map((weekNum) => {
            const position = getWeekPosition(weekNum);
            return (
              <div
                key={weekNum}
                style={{
                  position: 'absolute',
                  left: `${position}%`,
                  transform: 'translateX(-50%)',
                  fontSize: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2
                }}
                title={`Week ${weekNum}`}
              >
                <span>{getMilestoneForWeek(weekNum)}</span>
                <small style={{ fontSize: '0.5rem', color: '#6c757d', marginTop: '2px' }}>
                  {weekNum}w
                </small>
              </div>
            );
          })}
        </div>

        {/* Segmented Progress Bar - 40 segments */}
        <div 
          className="d-flex"
          style={{ 
            width: '100%',
            gap: '1px',
            backgroundColor: '#dee2e6',
            padding: '1px',
            borderRadius: '5px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {segments.map((segment) => (
            <div
              key={segment.weekNumber}
              className={segment.class}
              style={{
                flex: 1,
                height: '20px',
                backgroundColor: segment.color,
                transition: 'background-color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: segment.weekNumber === weeks ? 'bold' : 'normal',
                color: segment.weekNumber === weeks ? '#000' : 
                       segment.weekNumber < weeks ? '#fff' : '#6c757d',
                minWidth: '2%',
                position: 'relative'
              }}
              title={`Week ${segment.weekNumber}`}
            >
              {segment.weekNumber === weeks && weeks > 0 && (
                <span style={{ fontSize: '0.55rem', fontWeight: 'bold' }}>
                  {weeks}w
                </span>
              )}
            </div>
          ))}
        </div>

        {/* LMP and EDD dates below the progress bar */}
        <div className="d-flex justify-content-between align-items-center mt-1" style={{ fontSize: '0.65rem' }}>
          {lmpDate && (
            <small className="text-muted fw-bold">
              LMP: {lmpDate}
            </small>
          )}
          {!lmpDate && <div></div>}
          {eddDate && (
            <small className="text-muted fw-bold">
              EDD: {eddDate}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default PregnancyProgressBar;

