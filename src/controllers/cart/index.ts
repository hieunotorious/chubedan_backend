import { Request, Response } from 'express';
import { Product, User } from 'src/models';
import { ProductCartType } from 'src/models/user/cart';
import { getIdFromReq } from 'src/utils/token';

const addToCart = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const { product_id, quantity } = req.body;
    if (product_id && quantity) {
      const product = await Product.findById(product_id);
      if (product) {
        const newProductCart: ProductCartType = {
          product_id: product_id,
          img: product.img,
          name: product.name,
          price: product.price,
          quantity,
          sale: product.sale
        };
        const user = await User.findOneAndUpdate(
          { _id },
          {
            $addToSet: { cart: newProductCart }
          },

          { new: true }
        );
        if (user) {
          return res.status(201).json(user.cart);
        } else {
          return res.status(500).json({ message: 'Failed To Add Product' });
        }
      } else {
        return res.status(500).json({ message: 'Product Does Not Exist' });
      }
    } else {
      return res.status(500).json({ message: 'Product Does Not Exist' });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const clearCart = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const user = await User.findOneAndUpdate(
      { _id },
      {
        $set: {
          cart: []
        }
      },
      { new: true }
    );
    if (user) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ message: 'Failed To Clear Cart' });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const updateProductCartQuantity = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const { product_id, quantity } = req.body;
    if (product_id && quantity) {
      const user = await User.findOneAndUpdate(
        { _id, cart: { $elemMatch: { product_id } } },
        {
          $inc: {
            'cart.$.quantity': quantity
          }
        },
        { new: true }
      );
      if (user) {
        return res.status(200).json(user.cart);
      } else {
        return res.status(500).json({ message: 'Failed To Update Product Cart' });
      }
    } else {
      return res.status(500).json({
        message: 'Product Does Not Existed In Your Cart'
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const removeFromCart = async (req: Request, res: Response) => {
  try {
    const _id = getIdFromReq(req);
    const { product_id } = req.body;
    if (product_id) {
      const user = await User.findOneAndUpdate(
        { _id, cart: { $elemMatch: { product_id } } },
        {
          $pull: {
            cart: { product_id }
          }
        },
        { new: true }
      );
      if (user) {
        return res.status(200).json(user.cart);
      } else {
        return res.status(500).json({ message: 'Failed To Remove Product' });
      }
    } else {
      return res.status(500).json({
        message: 'Product Does Not Existed In Your Cart'
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

export default {
  addToCart,
  updateProductCartQuantity,
  clearCart,
  removeFromCart
};
