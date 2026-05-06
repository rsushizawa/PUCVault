const multer = require('multer');

const MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  sourceCode: [
    'text/plain', 'text/javascript', 'text/html', 'text/css', 'application/json',
    'application/typescript', 'text/x-python', 'application/x-python-code',
    'text/x-c', 'text/x-c++src', 'text/x-java-source', 'text/x-csharp',
    'text/x-ruby', 'text/x-go', 'text/rust', 'application/x-httpd-php',
    'application/x-sh', 'text/x-csrc', 'text/x-chdr', 'text/x-shellscript'
  ]
};

const createFilter = (allowedCategories) => {
  return (req, file, cb) => {
    console.log(`DEBUG: Tentando subir: ${file.originalname} | Mimetype: ${file.mimetype}`);
    const allowedTypes = allowedCategories.reduce((acc, category) => {
      return acc.concat(MIME_TYPES[category] || []);
    }, []);
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type Blocked. Waiting for one of the categories: ${allowedCategories.join(', ')}`));
    }
  };
};


const storage = multer.memoryStorage();

const onlyImage = multer({
  storage,
  fileFilter: createFilter(['images']),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const onlyDocument = multer({
  storage,
  fileFilter: createFilter(['documents']),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const onlySourceCode = multer({
  storage,
  fileFilter: createFilter(['sourceCode']),
  limits: { fileSize: 2 * 1024 * 1024 }
});

const all = multer({
  storage,
  fileFilter: createFilter(['images', 'documents', 'sourceCode']),
  limits: { fileSize: 10 * 1024 * 1024 }
});


module.exports = {
  onlyImage, onlyDocument, onlySourceCode, all
};
