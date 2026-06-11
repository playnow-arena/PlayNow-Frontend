export const normalizeSportName = (sport) => (
  sport === 'Cricket Nets' ? 'Cricket' : sport
);

export const normalizeSportTypes = (sports = []) => {
  const values = Array.isArray(sports) ? sports : [sports];
  return values.map(normalizeSportName).filter(Boolean);
};

export const formatSportTypes = (sports = []) => (
  normalizeSportTypes(sports).join(', ')
);

export const sportMatchesFilter = (sports = [], filterSport) => (
  filterSport === 'All' || normalizeSportTypes(sports).includes(filterSport)
);
