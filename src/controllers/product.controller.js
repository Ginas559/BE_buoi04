import { getHomeSections } from '../services/product.service';

export const getHomeProducts = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 8;
        const safeLimit = Math.min(Math.max(limit, 1), 20);

        const sections = await getHomeSections(safeLimit);

        return res.status(200).json({
            errCode: 0,
            errMessage: 'Lấy dữ liệu trang chủ thành công',
            data: sections,
        });
    } catch (error) {
        console.error('Product Controller Error:', error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Lỗi server khi lấy dữ liệu sản phẩm trang chủ',
        });
    }
};