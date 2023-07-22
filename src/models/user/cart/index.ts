export type ProductCartType = {
  product_id: string;
  img: string;
  name: string;
  price: number;
  quantity: number;
  sale?: number;
};

/*******************************SCHEMA*****************************/
export const ProductCart = {
  product_id: { type: String, required: true },
  img: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sale: Number
};
