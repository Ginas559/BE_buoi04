import Product from '../models/product.model';

const PRODUCT_SELECT_FIELDS =
    'name slug brand category image price oldPrice discount soldCount rating shortDescription isPromotion isLatest isBestSeller';

const mapProduct = (product) => ({
    id: product._id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    category: product.category,
    image: product.image,
    price: product.price,
    oldPrice: product.oldPrice,
    discount: product.discount,
    sold: product.soldCount,
    rating: product.rating,
    shortDescription: product.shortDescription,
});

export const getHomeSections = async (limit = 8) => {
    const [promotion, latest, bestseller] = await Promise.all([
        Product.find({ isActive: true, isPromotion: true })
            .sort({ discount: -1, createdAt: -1 })
            .limit(limit)
            .select(PRODUCT_SELECT_FIELDS)
            .lean(),
        Product.find({ isActive: true, isLatest: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select(PRODUCT_SELECT_FIELDS)
            .lean(),
        Product.find({ isActive: true, isBestSeller: true })
            .sort({ soldCount: -1, rating: -1 })
            .limit(limit)
            .select(PRODUCT_SELECT_FIELDS)
            .lean(),
    ]);

    return {
        promotion: promotion.map(mapProduct),
        latest: latest.map(mapProduct),
        bestseller: bestseller.map(mapProduct),
    };
};