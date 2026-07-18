const loaded = new Map();

const gradeLoaders = {
  P: () => import('./subjects/p'),
  K: () => import('./subjects/k'),
  '1': () => import('./subjects/g1'),
  '2': () => import('./subjects/g2'),
  '3': () => import('./subjects/g3'),
  '4': () => import('./subjects/g4'),
  '5': () => import('./subjects/g5'),
  '6': () => import('./subjects/g6'),
  '7': () => import('./subjects/g7'),
  '8': () => import('./subjects/g8'),
  A1: () => import('./subjects/a1'),
  G: () => import('./subjects/geometry'),
  A2: () => import('./subjects/a2'),
  PC: () => import('./subjects/precalculus'),
  C: () => import('./subjects/calculus'),
};

function toSectionModel(gradeCode, rawValue) {
  if (Array.isArray(rawValue)) {
    return {
      gradeCode,
      title: 'Math skills',
      sections: [
        {
          id: 'S',
          title: 'Skills',
          skills: rawValue.map((item) => item.title),
        },
      ],
    };
  }

  if (rawValue && Array.isArray(rawValue.sections)) {
    return rawValue;
  }

  return {
    gradeCode,
    title: 'Math skills',
    sections: [],
  };
}

export async function loadSubjectsByGrade(gradeCode) {
  if (loaded.has(gradeCode)) {
    return loaded.get(gradeCode);
  }

  const loader = gradeLoaders[gradeCode];
  if (!loader) {
    return [];
  }

  const module = await loader();
  const rawValue = module.default || [];
  const payload = toSectionModel(gradeCode, rawValue);
  loaded.set(gradeCode, payload);
  return payload;
}
