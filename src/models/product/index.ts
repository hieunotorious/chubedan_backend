import { Schema, model, Document } from 'mongoose';

/*********************TYPE & INTERFACE*****************************/

export type ProductType = {
  img: string;
  name: string;
  review: number;
  price: number;
  rating: number;
  description?: string;
  brand: BrandType;
  sale?: number;
  category: CategoryType;
  available: boolean;
  all: AllType;
};

export enum BrandType {
  marvel_legend = 'MARVEL_LEGEND',
  mcfarlane = 'MCFARLANE',
  shf = 'SHF',
  mafex = 'MAFEX',
  dc_collectibles = 'DC_COLLECTIBLES',
  wwe = 'WWE',
  figuart = 'FIGUART'
}

export enum CategoryType {
  action_figure = 'ACTION_FIGURE',
  statue = 'STATUE'
}

export enum AllType {
  new = 'NEW',
  sale = 'SALE',
  pre_order = 'PRE_ORDER'
}

/*******************************SCHEMA*****************************/

export type ProductTypeModel = ProductType & Document;

const productSchema = new Schema(
  {
    img: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    brand: {
      type: String,
      enum: ['MARVEL_LEGEND', 'MCFARLANE', 'SHF', 'MAFEX', 'DC_COLLECTIBLES', 'WWE', 'FIGUART'],
      default: 'SHF'
    },
    review: { type: Number, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    sale: Number,
    category: {
      type: String,
      enum: ['STATUE', 'ACTION_FIGURE'],
      default: 'STATUE'
    },

    available: { type: Boolean, default: true },
    all: { type: String, enum: ['NEW', 'SALE', 'PRE_ORDER'], default: 'NEW' }
  },
  { timestamps: true }
);

export default model<ProductTypeModel>('Product', productSchema);
