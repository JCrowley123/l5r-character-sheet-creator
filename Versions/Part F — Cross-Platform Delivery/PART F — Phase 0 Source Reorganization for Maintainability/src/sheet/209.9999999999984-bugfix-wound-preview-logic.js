  // BUGFIX WP7: wound preview row data, independent of the UI.
  const WOUND_SETTINGS_PREVIEW_ENABLED = true;
  const WP7Logic = {
    rows(levels, thresholds) {
      if(!Array.isArray(thresholds) || levels.length !== thresholds.length) return [];
      return levels.map((level,index) => ({name:level.name,total:thresholds[index]}));
    }
  };
