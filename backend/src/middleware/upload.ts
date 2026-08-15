import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc (older format)
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const ext = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf('.'));
  const isValidExt = ALLOWED_EXTENSIONS.includes(ext);

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
}

export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('resume');

export const uploadJD = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('jd');