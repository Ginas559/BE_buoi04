import Product from '../models/product.model';

const PRODUCT_SELECT_FIELDS =
    'name slug brand category image images price oldPrice discount stock soldCount rating description shortDescription isPromotion isLatest isBestSeller';

const mapProduct = (product) => ({
    id: product._id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    category: product.category,
    image: product.image,
    images: Array.isArray(product.images) && product.images.length ? product.images : [product.image].filter(Boolean),
    price: product.price,
    oldPrice: product.oldPrice,
    discount: product.discount,
    stock: product.stock,
    sold: product.soldCount,
    rating: product.rating,
    description: product.description || product.shortDescription,
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

export const getProductDetailBySlug = async (slug) => {
    const product = await Product.findOne({ slug, isActive: true })
        .select(PRODUCT_SELECT_FIELDS)
        .lean();

    if (!product) {
        return null;
    }

    const relatedProducts = await Product.find({
        isActive: true,
        slug: { $ne: slug },
        category: product.category,
    })
        .sort({ soldCount: -1, rating: -1 })
        .limit(8)
        .select(PRODUCT_SELECT_FIELDS)
        .lean();

    return {
        product: mapProduct(product),
        related: relatedProducts.map(mapProduct),
    };
};