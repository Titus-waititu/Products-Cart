interface TProduct {
    id?: number;
    image: {
        desktop: string;
        mobile: string;
    };
    name: string;
    category: string;
    price: number;
}
export type {TProduct}