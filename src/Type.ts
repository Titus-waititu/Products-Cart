interface TProduct {
    id?: number;
    image: {
        desktop: string;
        mobile: string;
    };
    name: string;
    category: string;
    price: number;
    quantity?: number;
}
export type {TProduct}