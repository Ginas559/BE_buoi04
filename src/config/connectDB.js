import mongoose from 'mongoose';
import { seedInitialData } from '../seed/autoSeed';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_DB_URL || process.env.MONGO_URI;
        
        if (!uri) {
            throw new Error('MONGO_DB_URL hoặc MONGO_URI không tồn tại trong file .env!');
        }

        await mongoose.connect(uri);
        console.log('Kết nối MongoDB thành công!');

        // Seed dữ liệu khởi tạo theo kiểu idempotent: có thì bỏ qua, thiếu thì thêm.
        await seedInitialData();
    } catch (error) {
        console.error('Kết nối MongoDB thất bại:', error);
    }
}

export default connectDB; 