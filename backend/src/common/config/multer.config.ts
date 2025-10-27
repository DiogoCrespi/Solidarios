import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/profile-photos',
    filename: (req, file, callback) => {
      const uniqueId = uuidv4();
      const fileExtension = extname(file.originalname);
      const filename = `${uniqueId}${fileExtension}`;
      callback(null, filename);
    },
  }),
  fileFilter: (req: any, file: any, callback: any) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return callback(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

