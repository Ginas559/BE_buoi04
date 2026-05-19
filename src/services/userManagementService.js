import bcrypt from 'bcryptjs';
import User from '../models/user.js';

const allowedRoles = ['R1', 'R2', 'R3'];

const sanitizeUser = (user) => ({
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    address: user.address,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    image: user.image,
    roleId: user.roleId,
    positionId: user.positionId,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

const listUsers = async () => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 }).lean();

        return {
            errCode: 0,
            errMessage: 'Lấy danh sách người dùng thành công',
            users: users.map((user) => sanitizeUser(user))
        };
    } catch (error) {
        console.error('List Users Service Error:', error);
        throw error;
    }
};

const createUser = async (payload) => {
    try {
        const email = String(payload.email || '').toLowerCase().trim();
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return {
                errCode: 1,
                errMessage: 'Email đã được sử dụng'
            };
        }

        const roleId = allowedRoles.includes(payload.roleId) ? payload.roleId : 'R2';
        const hashedPassword = await bcrypt.hash(payload.password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            firstName: payload.firstName,
            lastName: payload.lastName,
            address: payload.address,
            phoneNumber: payload.phoneNumber,
            gender: payload.gender,
            image: payload.image,
            roleId,
            positionId: payload.positionId,
            isActive: payload.isActive ?? true
        });

        return {
            errCode: 0,
            errMessage: 'Tạo người dùng thành công',
            user: sanitizeUser(user)
        };
    } catch (error) {
        console.error('Create User Service Error:', error);
        throw error;
    }
};

const updateUser = async (userId, payload) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            return {
                errCode: 1,
                errMessage: 'Không tìm thấy người dùng'
            };
        }

        if (payload.email) {
            const nextEmail = String(payload.email).toLowerCase().trim();
            const duplicate = await User.findOne({ email: nextEmail, _id: { $ne: userId } });
            if (duplicate) {
                return {
                    errCode: 2,
                    errMessage: 'Email đã được sử dụng'
                };
            }
            user.email = nextEmail;
        }

        const updatableFields = ['firstName', 'lastName', 'address', 'phoneNumber', 'gender', 'image', 'roleId', 'positionId', 'isActive'];

        for (const field of updatableFields) {
            if (payload[field] !== undefined) {
                user[field] = payload[field];
            }
        }

        if (payload.password) {
            user.password = await bcrypt.hash(payload.password, 10);
        }

        await user.save();

        return {
            errCode: 0,
            errMessage: 'Cập nhật người dùng thành công',
            user: sanitizeUser(user)
        };
    } catch (error) {
        console.error('Update User Service Error:', error);
        throw error;
    }
};

const deleteUser = async (userId) => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return {
                errCode: 1,
                errMessage: 'Không tìm thấy người dùng'
            };
        }

        return {
            errCode: 0,
            errMessage: 'Xóa người dùng thành công',
            user: sanitizeUser(deletedUser)
        };
    } catch (error) {
        console.error('Delete User Service Error:', error);
        throw error;
    }
};

export default {
    listUsers,
    createUser,
    updateUser,
    deleteUser
};