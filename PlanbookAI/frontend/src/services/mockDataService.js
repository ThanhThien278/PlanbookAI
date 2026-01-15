/**
 * Mock Data Service với localStorage
 * Lưu trữ dữ liệu local và cung cấp CRUD operations realtime
 */

// ======================
// INITIAL MOCK DATA
// ======================

const INITIAL_QUESTIONS = [
  {
    id: '1',
    subject: 'Toán học',
    topic: 'Đại số',
    grade_level: '10',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    question_text: 'Giải phương trình: 2x + 3 = 11',
    options: {
      'A': 'x = 4',
      'B': 'x = 5',
      'C': 'x = 6',
      'D': 'x = 7'
    },
    correct_answer: 'A',
    explanation: '2x + 3 = 11 => 2x = 8 => x = 4',
    points: 1.0,
    tags: ['đại số', 'phương trình'],
    is_public: true,
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    subject: 'Vật lý',
    topic: 'Cơ học',
    grade_level: '11',
    question_type: 'multiple_choice',
    difficulty: 'hard',
    question_text: 'Một vật chuyển động thẳng đều với vận tốc 10 m/s. Quãng đường vật đi được sau 5 giây là:',
    options: {
      'A': '50 m',
      'B': '25 m',
      'C': '15 m',
      'D': '10 m'
    },
    correct_answer: 'A',
    explanation: 's = v.t = 10.5 = 50 m',
    points: 1.0,
    tags: ['cơ học', 'chuyển động'],
    is_public: true,
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    subject: 'Hóa học',
    topic: 'Hóa hữu cơ',
    grade_level: '12',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    question_text: 'Công thức phân tử của metan là:',
    options: {
      'A': 'CH4',
      'B': 'C2H6',
      'C': 'C3H8',
      'D': 'C4H10'
    },
    correct_answer: 'A',
    explanation: 'Metan có công thức CH4',
    points: 1.0,
    tags: ['hóa hữu cơ', 'hydrocarbon'],
    is_public: true,
    created_by: 'teacher',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_EXAMS = [
  {
    id: '1',
    title: 'Đề thi giữa kỳ môn Toán lớp 10',
    subject: 'Toán học',
    grade_level: '10',
    duration: 90,
    total_questions: 20,
    total_points: 20.0,
    instructions: 'Thời gian làm bài: 90 phút. Học sinh làm bài trực tiếp trên giấy.',
    status: 'published',
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: ['1']
  },
  {
    id: '2',
    title: 'Đề kiểm tra 15 phút Vật lý 11',
    subject: 'Vật lý',
    grade_level: '11',
    duration: 15,
    total_questions: 10,
    total_points: 10.0,
    instructions: 'Thời gian làm bài: 15 phút.',
    status: 'draft',
    created_by: 'teacher',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions: ['2']
  }
];

const INITIAL_LESSONS = [
  {
    id: '1',
    title: 'Bài 1: Phương trình bậc nhất một ẩn',
    subject: 'Toán học',
    grade_level: '10',
    topic: 'Đại số',
    duration: 45,
    objectives: ['Hiểu được khái niệm phương trình bậc nhất', 'Biết cách giải phương trình bậc nhất'],
    content: '<h2>1. Khái niệm</h2><p>Phương trình bậc nhất một ẩn có dạng ax + b = 0...</p>',
    activities: ['Hoạt động 1: Giới thiệu', 'Hoạt động 2: Luyện tập'],
    materials: ['Sách giáo khoa', 'Bảng phụ'],
    created_by: 'teacher',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Bài 2: Chuyển động thẳng đều',
    subject: 'Vật lý',
    grade_level: '11',
    topic: 'Cơ học',
    duration: 45,
    objectives: ['Hiểu được khái niệm chuyển động thẳng đều', 'Vận dụng công thức tính quãng đường'],
    content: '<h2>1. Khái niệm</h2><p>Chuyển động thẳng đều là chuyển động có quỹ đạo là đường thẳng...</p>',
    activities: ['Hoạt động 1: Thí nghiệm', 'Hoạt động 2: Bài tập'],
    materials: ['Máy đo tốc độ', 'Video minh họa'],
    created_by: 'teacher',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@planbookai.com',
    full_name: 'Quản trị viên hệ thống',
    role: 'admin',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    username: 'teacher1',
    email: 'teacher1@example.com',
    full_name: 'Nguyễn Văn A',
    role: 'teacher',
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString()
  }
];

const INITIAL_TEMPLATES = [
  {
    id: '1',
    name: 'Template giáo án Toán học',
    subject: 'Toán học',
    grade_level: '10',
    content: {
      structure: ['Mục tiêu', 'Nội dung', 'Hoạt động', 'Đánh giá'],
      default_content: 'Template mẫu cho giáo án Toán học'
    },
    created_at: new Date().toISOString()
  }
];

const INITIAL_PACKAGES = [
  {
    id: '1',
    name: 'Gói Basic',
    price: 50000,
    duration: 30,
    features: ['10 giáo án/tháng', '50 câu hỏi', 'Hỗ trợ email'],
    subscriptions: 45,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Gói Premium',
    price: 150000,
    duration: 30,
    features: ['Không giới hạn giáo án', 'Không giới hạn câu hỏi', 'Ưu tiên hỗ trợ', 'Tính năng OCR'],
    subscriptions: 75,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// ======================
// STORAGE HELPERS
// ======================

const getStorageKey = (key) => `planbookai_${key}`;

const loadFromStorage = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default data
    localStorage.setItem(getStorageKey(key), JSON.stringify(defaultValue));
    return defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
};

// ======================
// INITIALIZE STORAGE
// ======================

export const initializeMockData = () => {
  // Chỉ init nếu chưa có dữ liệu
  if (!localStorage.getItem(getStorageKey('questions'))) {
    saveToStorage('questions', INITIAL_QUESTIONS);
  }
  if (!localStorage.getItem(getStorageKey('exams'))) {
    saveToStorage('exams', INITIAL_EXAMS);
  }
  if (!localStorage.getItem(getStorageKey('lessons'))) {
    saveToStorage('lessons', INITIAL_LESSONS);
  }
  if (!localStorage.getItem(getStorageKey('templates'))) {
    saveToStorage('templates', INITIAL_TEMPLATES);
  }
  if (!localStorage.getItem(getStorageKey('packages'))) {
    saveToStorage('packages', INITIAL_PACKAGES);
  }
  if (!localStorage.getItem(getStorageKey('users'))) {
    saveToStorage('users', INITIAL_USERS);
  }
  if (!localStorage.getItem(getStorageKey('curriculum'))) {
    saveToStorage('curriculum', INITIAL_CURRICULUM);
  }
};

// ======================
// QUESTIONS SERVICE
// ======================

export const mockQuestionService = {
  getAll: async (params = {}) => {
    const questions = loadFromStorage('questions', INITIAL_QUESTIONS);
    
    // Filter
    let filtered = [...questions];
    
    if (params.subject) {
      filtered = filtered.filter(q => q.subject === params.subject);
    }
    if (params.topic) {
      filtered = filtered.filter(q => q.topic === params.topic);
    }
    if (params.difficulty) {
      filtered = filtered.filter(q => q.difficulty === params.difficulty);
    }
    if (params.question_type) {
      filtered = filtered.filter(q => q.question_type === params.question_type);
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(q => 
        q.question_text.toLowerCase().includes(searchLower) ||
        q.subject.toLowerCase().includes(searchLower) ||
        q.topic.toLowerCase().includes(searchLower)
      );
    }
    
    return { data: filtered };
  },
  
  getById: async (id) => {
    const questions = loadFromStorage('questions', INITIAL_QUESTIONS);
    const question = questions.find(q => q.id === id);
    if (!question) {
      throw new Error('Câu hỏi không tồn tại');
    }
    return { data: question };
  },
  
  create: async (data) => {
    const questions = loadFromStorage('questions', INITIAL_QUESTIONS);
    const newQuestion = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    questions.push(newQuestion);
    saveToStorage('questions', questions);
    return { data: newQuestion };
  },
  
  update: async (id, data) => {
    const questions = loadFromStorage('questions', INITIAL_QUESTIONS);
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Câu hỏi không tồn tại');
    }
    questions[index] = {
      ...questions[index],
      ...data,
      id,
      updated_at: new Date().toISOString()
    };
    saveToStorage('questions', questions);
    return { data: questions[index] };
  },
  
  delete: async (id) => {
    const questions = loadFromStorage('questions', INITIAL_QUESTIONS);
    const filtered = questions.filter(q => q.id !== id);
    if (filtered.length === questions.length) {
      throw new Error('Câu hỏi không tồn tại');
    }
    saveToStorage('questions', filtered);
    return { data: { id } };
  },
  
  approve: async (id) => {
    const questions = loadFromStorage('questions', INITIAL_QUESTIONS);
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error('Câu hỏi không tồn tại');
    }
    questions[index].is_approved = true;
    questions[index].updated_at = new Date().toISOString();
    saveToStorage('questions', questions);
    return { data: questions[index] };
  },
  
  getStats: async () => {
    const questions = loadFromStorage('questions', INITIAL_QUESTIONS);
    return {
      data: {
        total: questions.length,
        by_subject: questions.reduce((acc, q) => {
          acc[q.subject] = (acc[q.subject] || 0) + 1;
          return acc;
        }, {}),
        by_difficulty: questions.reduce((acc, q) => {
          acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
          return acc;
        }, {})
      }
    };
  }
};

// ======================
// EXAMS SERVICE
// ======================

export const mockExamService = {
  getAll: async (params = {}) => {
    const exams = loadFromStorage('exams', INITIAL_EXAMS);
    let filtered = [...exams];
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchLower) ||
        e.subject.toLowerCase().includes(searchLower)
      );
    }
    
    return { data: filtered };
  },
  
  getById: async (id) => {
    const exams = loadFromStorage('exams', INITIAL_EXAMS);
    const exam = exams.find(e => e.id === id);
    if (!exam) {
      throw new Error('Đề thi không tồn tại');
    }
    return { data: exam };
  },
  
  create: async (data) => {
    const exams = loadFromStorage('exams', INITIAL_EXAMS);
    const newExam = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: data.questions || []
    };
    exams.push(newExam);
    saveToStorage('exams', exams);
    return { data: newExam };
  },
  
  update: async (id, data) => {
    const exams = loadFromStorage('exams', INITIAL_EXAMS);
    const index = exams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Đề thi không tồn tại');
    }
    exams[index] = {
      ...exams[index],
      ...data,
      id,
      updated_at: new Date().toISOString()
    };
    saveToStorage('exams', exams);
    return { data: exams[index] };
  },
  
  delete: async (id) => {
    const exams = loadFromStorage('exams', INITIAL_EXAMS);
    const filtered = exams.filter(e => e.id !== id);
    if (filtered.length === exams.length) {
      throw new Error('Đề thi không tồn tại');
    }
    saveToStorage('exams', filtered);
    return { data: { id } };
  },
  
  addQuestions: async (id, questionIds) => {
    const exams = loadFromStorage('exams', INITIAL_EXAMS);
    const index = exams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Đề thi không tồn tại');
    }
    exams[index].questions = [...new Set([...exams[index].questions, ...questionIds])];
    exams[index].total_questions = exams[index].questions.length;
    exams[index].updated_at = new Date().toISOString();
    saveToStorage('exams', exams);
    return { data: exams[index] };
  },
  
  publish: async (id) => {
    const exams = loadFromStorage('exams', INITIAL_EXAMS);
    const index = exams.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Đề thi không tồn tại');
    }
    exams[index].status = 'published';
    exams[index].updated_at = new Date().toISOString();
    saveToStorage('exams', exams);
    return { data: exams[index] };
  }
};

// ======================
// LESSONS SERVICE
// ======================

export const mockLessonService = {
  getAll: async (params = {}) => {
    const lessons = loadFromStorage('lessons', INITIAL_LESSONS);
    let filtered = [...lessons];
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchLower) ||
        l.subject.toLowerCase().includes(searchLower)
      );
    }
    
    return { data: filtered };
  },
  
  getById: async (id) => {
    const lessons = loadFromStorage('lessons', INITIAL_LESSONS);
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) {
      throw new Error('Giáo án không tồn tại');
    }
    return { data: lesson };
  },
  
  create: async (data) => {
    const lessons = loadFromStorage('lessons', INITIAL_LESSONS);
    const newLesson = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    lessons.push(newLesson);
    saveToStorage('lessons', lessons);
    return { data: newLesson };
  },
  
  update: async (id, data) => {
    const lessons = loadFromStorage('lessons', INITIAL_LESSONS);
    const index = lessons.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Giáo án không tồn tại');
    }
    lessons[index] = {
      ...lessons[index],
      ...data,
      id,
      updated_at: new Date().toISOString()
    };
    saveToStorage('lessons', lessons);
    return { data: lessons[index] };
  },
  
  delete: async (id) => {
    const lessons = loadFromStorage('lessons', INITIAL_LESSONS);
    const filtered = lessons.filter(l => l.id !== id);
    if (filtered.length === lessons.length) {
      throw new Error('Giáo án không tồn tại');
    }
    saveToStorage('lessons', filtered);
    return { data: { id } };
  },
  
  duplicate: async (id) => {
    const lessons = loadFromStorage('lessons', INITIAL_LESSONS);
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) {
      throw new Error('Giáo án không tồn tại');
    }
    const duplicated = {
      ...lesson,
      id: Date.now().toString(),
      title: `${lesson.title} (Bản sao)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    lessons.push(duplicated);
    saveToStorage('lessons', lessons);
    return { data: duplicated };
  },
  
  generateWithAI: async (prompt) => {
    // Mock AI generation
    return {
      data: {
        title: 'Giáo án được tạo bởi AI',
        content: '<p>Nội dung giáo án được tạo tự động dựa trên prompt của bạn.</p>',
        objectives: ['Mục tiêu 1', 'Mục tiêu 2']
      }
    };
  },
  
  getTemplates: async () => {
    return { data: loadFromStorage('templates', INITIAL_TEMPLATES) };
  },
  
  getStats: async () => {
    const lessons = loadFromStorage('lessons', INITIAL_LESSONS);
    return {
      data: {
        total: lessons.length,
        by_subject: lessons.reduce((acc, l) => {
          acc[l.subject] = (acc[l.subject] || 0) + 1;
          return acc;
        }, {})
      }
    };
  }
};

// ======================
// TEMPLATES SERVICE
// ======================

export const mockTemplateService = {
  getAll: async () => {
    return { data: loadFromStorage('templates', INITIAL_TEMPLATES) };
  },
  
  getById: async (id) => {
    const templates = loadFromStorage('templates', INITIAL_TEMPLATES);
    const template = templates.find(t => t.id === id);
    if (!template) {
      throw new Error('Template không tồn tại');
    }
    return { data: template };
  },
  
  create: async (data) => {
    const templates = loadFromStorage('templates', INITIAL_TEMPLATES);
    const newTemplate = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    templates.push(newTemplate);
    saveToStorage('templates', templates);
    return { data: newTemplate };
  },
  
  update: async (id, data) => {
    const templates = loadFromStorage('templates', INITIAL_TEMPLATES);
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Template không tồn tại');
    }
    templates[index] = { ...templates[index], ...data, id };
    saveToStorage('templates', templates);
    return { data: templates[index] };
  },
  
  delete: async (id) => {
    const templates = loadFromStorage('templates', INITIAL_TEMPLATES);
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length === templates.length) {
      throw new Error('Template không tồn tại');
    }
    saveToStorage('templates', filtered);
    return { data: { id } };
  }
};

// ======================
// PACKAGES SERVICE
// ======================

export const mockPackageService = {
  getAll: async () => {
    return { data: loadFromStorage('packages', INITIAL_PACKAGES) };
  },
  
  getById: async (id) => {
    const packages = loadFromStorage('packages', INITIAL_PACKAGES);
    const pkg = packages.find(p => p.id === id);
    if (!pkg) {
      throw new Error('Gói dịch vụ không tồn tại');
    }
    return { data: pkg };
  },
  
  create: async (data) => {
    const packages = loadFromStorage('packages', INITIAL_PACKAGES);
    const newPackage = {
      ...data,
      id: Date.now().toString(),
      subscriptions: 0,
      created_at: new Date().toISOString()
    };
    packages.push(newPackage);
    saveToStorage('packages', packages);
    return { data: newPackage };
  },
  
  update: async (id, data) => {
    const packages = loadFromStorage('packages', INITIAL_PACKAGES);
    const index = packages.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Gói dịch vụ không tồn tại');
    }
    packages[index] = { ...packages[index], ...data, id };
    saveToStorage('packages', packages);
    return { data: packages[index] };
  },
  
  delete: async (id) => {
    const packages = loadFromStorage('packages', INITIAL_PACKAGES);
    const filtered = packages.filter(p => p.id !== id);
    if (filtered.length === packages.length) {
      throw new Error('Gói dịch vụ không tồn tại');
    }
    saveToStorage('packages', filtered);
    return { data: { id } };
  }
};

// ======================
// USERS SERVICE
// ======================

export const mockUserService = {
  getAll: async (params = {}) => {
    const users = loadFromStorage('users', INITIAL_USERS);
    let filtered = [...users];
    
    if (params.role && params.role !== 'all') {
      filtered = filtered.filter(u => u.role === params.role);
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.full_name.toLowerCase().includes(searchLower)
      );
    }
    
    return { data: filtered };
  },
  
  getById: async (id) => {
    const users = loadFromStorage('users', INITIAL_USERS);
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    return { data: user };
  },
  
  create: async (data) => {
    const users = loadFromStorage('users', INITIAL_USERS);
    const newUser = {
      ...data,
      id: Date.now().toString(),
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_verified: data.is_verified !== undefined ? data.is_verified : false,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    saveToStorage('users', users);
    return { data: newUser };
  },
  
  update: async (id, data) => {
    const users = loadFromStorage('users', INITIAL_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Người dùng không tồn tại');
    }
    users[index] = { ...users[index], ...data, id };
    saveToStorage('users', users);
    return { data: users[index] };
  },
  
  delete: async (id) => {
    const users = loadFromStorage('users', INITIAL_USERS);
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) {
      throw new Error('Người dùng không tồn tại');
    }
    saveToStorage('users', filtered);
    return { data: { id } };
  }
};

// ======================
// CURRICULUM SERVICE
// ======================

const INITIAL_CURRICULUM = [
  {
    id: '1',
    name: 'Khung chương trình Toán 10',
    subject: 'Toán học',
    grade_level: '10',
    description: 'Khung chương trình chuẩn môn Toán lớp 10',
    content: {
      units: [
        { name: 'Chương 1: Mệnh đề và tập hợp', topics: ['Mệnh đề', 'Tập hợp', 'Các phép toán tập hợp'] },
        { name: 'Chương 2: Hàm số bậc nhất và bậc hai', topics: ['Hàm số', 'Hàm số bậc nhất', 'Hàm số bậc hai'] }
      ]
    },
    created_at: new Date().toISOString()
  }
];

export const mockCurriculumService = {
  getAll: async () => {
    return { data: loadFromStorage('curriculum', INITIAL_CURRICULUM) };
  },
  
  getById: async (id) => {
    const curriculum = loadFromStorage('curriculum', INITIAL_CURRICULUM);
    const item = curriculum.find(c => c.id === id);
    if (!item) {
      throw new Error('Khung chương trình không tồn tại');
    }
    return { data: item };
  },
  
  create: async (data) => {
    const curriculum = loadFromStorage('curriculum', INITIAL_CURRICULUM);
    const newItem = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    curriculum.push(newItem);
    saveToStorage('curriculum', curriculum);
    return { data: newItem };
  },
  
  update: async (id, data) => {
    const curriculum = loadFromStorage('curriculum', INITIAL_CURRICULUM);
    const index = curriculum.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Khung chương trình không tồn tại');
    }
    curriculum[index] = { ...curriculum[index], ...data, id };
    saveToStorage('curriculum', curriculum);
    return { data: curriculum[index] };
  },
  
  delete: async (id) => {
    const curriculum = loadFromStorage('curriculum', INITIAL_CURRICULUM);
    const filtered = curriculum.filter(c => c.id !== id);
    if (filtered.length === curriculum.length) {
      throw new Error('Khung chương trình không tồn tại');
    }
    saveToStorage('curriculum', filtered);
    return { data: { id } };
  }
};

// Initialize on import
initializeMockData();

