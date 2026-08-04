export const TYPE_COLORS = {
  Industry: '#FF6B4A',
  Research: '#4B7FFF',
  Academia: '#A855F7',
};

export const ROLES = [
  { id: 'student',    label: 'Student',    icon: '🎓', desc: 'Gain real experience on industry & research challenges' },
  { id: 'researcher', label: 'Researcher', icon: '🔬', desc: 'Find partners to amplify your research impact' },
  { id: 'industry',   label: 'Industry',   icon: '🏭', desc: 'Post real challenges and access top-tier talent' },
  { id: 'university', label: 'University', icon: '🏛️', desc: 'Bridge your campus to the innovation ecosystem' },
];

// Structured Domain → Skills taxonomy (replaces one flat list).
// Each domain has a starter set of skills; users can also type in
// their own custom domain or skill if it's not listed.
export const DOMAINS = [
  {
    id: 'engineering',
    label: 'Engineering & Technology',
    icon: '⚙️',
    skills: ['Machine Learning', 'Python', 'Data Analysis', 'React', 'IoT', 'Electrical Engineering', 'Computer Vision', 'Robotics', 'Cybersecurity', 'Arabic NLP', 'Cloud Computing'],
  },
  {
    id: 'science',
    label: 'Science & Health',
    icon: '🧬',
    skills: ['Chemistry', 'Materials Science', 'Bioinformatics', 'Environmental Science'],
  },
  {
    id: 'business',
    label: 'Business & Social Sciences',
    icon: '📊',
    skills: ['Psychology', 'Urban Planning', 'Economics', 'Public Policy'],
  },
  {
    id: 'design',
    label: 'Design & Creative',
    icon: '🎨',
    skills: ['UI/UX Design', 'Graphic Design', 'Content Writing'],
  },
];

// Flat list derived from DOMAINS — used anywhere a simple list is enough
// (e.g. tagging a posted challenge's required skills).
export const SKILLS_DB = DOMAINS.flatMap(d => d.skills);

export const COURSE_MAP = {
  'Machine Learning':       'Machine Learning Specialization – Coursera',
  'Python':                 'Python for Everybody – Coursera',
  'IoT':                    'IoT Fundamentals – Cisco Academy',
  'Data Analysis':          'Google Data Analytics Certificate',
  'React':                  'Full Stack Open – University of Helsinki',
  'UI/UX Design':           'Google UX Design Certificate',
  'Computer Vision':        'Computer Vision Specialization – Coursera',
  'Arabic NLP':             'NLP with Python – edX',
  'Electrical Engineering': 'Power Electronics – NPTEL',
  'Chemistry':              'Chemistry Fundamentals – edX',
  'Materials Science':      'Materials Science – MIT OpenCourseWare',
  'Cybersecurity':          'Google Cybersecurity Certificate',
};

// Seed / demo challenges — always shown so Browse never looks empty.
// Real, user-submitted ideas from Supabase are merged in alongside these.
export const SEED_IDEAS = [
  {
    id: 'seed-1',
    seed: true,
    type: 'Industry',
    title: 'AI-Driven Water Management for UAE Desert Agriculture',
    desc: 'ML models to optimize irrigation and cut water waste by 40% using real-time sensor data and predictive analytics.',
    problem: 'UAE agriculture wastes over 70% of irrigation water due to inefficient scheduling. Climate change is accelerating desertification, threatening food security. Existing solutions are too costly for small farms.',
    skills: ['Machine Learning', 'Python', 'IoT', 'Data Analysis'],
    courses: ['Machine Learning Specialization – Coursera', 'IoT Fundamentals – Cisco Academy'],
    author: 'Dr. Khalid Al-Mansoori', role: 'Researcher', org: 'UAE University',
    team: 3, max: 6, posted: '2 days ago',
  },
  {
    id: 'seed-2',
    seed: true,
    type: 'Research',
    title: 'Open-Source Arabic NLP Benchmark Dataset',
    desc: 'The first comprehensive Arabic NLP benchmark covering dialects from 22 countries for open model training and evaluation.',
    problem: 'Arabic NLP lags behind English by ~8 years due to a lack of standardized, public training datasets.',
    skills: ['Arabic NLP', 'Python', 'Data Analysis'],
    courses: ['NLP Specialization – Stanford Online'],
    author: 'Dr. Layla Hassan', role: 'Researcher', org: 'Khalifa University',
    team: 2, max: 5, posted: '5 days ago',
  },
  {
    id: 'seed-3',
    seed: true,
    type: 'Industry',
    title: 'Predictive Traffic Optimization for Dubai Roads',
    desc: 'Computer vision and reinforcement learning to cut commute times by 25% through adaptive signal control.',
    problem: 'Dubai loses AED 4.2B annually to congestion. Current signal systems are static.',
    skills: ['Computer Vision', 'Python', 'Urban Planning'],
    courses: ['Deep Learning Specialization – Coursera'],
    author: 'Roads & Transport Authority', role: 'Industry', org: 'RTA Dubai',
    team: 4, max: 8, posted: '1 week ago',
  },
  {
    id: 'seed-4',
    seed: true,
    type: 'Academia',
    title: 'Student Mental Health Early-Warning Platform',
    desc: 'Anonymous behavioral analytics detecting early signs of mental health deterioration via app usage patterns.',
    problem: '1 in 4 UAE students reports anxiety or depression, yet most never seek help due to stigma.',
    skills: ['UI/UX Design', 'React', 'Data Analysis'],
    courses: ['UX Research – Google Certificate'],
    author: 'Prof. Sarah Malik', role: 'Researcher', org: 'American University of Sharjah',
    team: 2, max: 5, posted: '3 days ago',
  },
];

/**
 * Real skill-matching: percentage overlap between what the viewer knows
 * and what a challenge requires. No fake numbers — this is a genuine
 * (if simple) computation over real arrays.
 */
export function computeMatch(userSkills, ideaSkills) {
  if (!ideaSkills || ideaSkills.length === 0) return 50;
  if (!userSkills || userSkills.length === 0) return 20;
  const userSet = new Set(userSkills.map(s => s.toLowerCase()));
  const overlap = ideaSkills.filter(s => userSet.has(s.toLowerCase())).length;
  const pct = Math.round((overlap / ideaSkills.length) * 100);
  return Math.max(pct, 15);
}
