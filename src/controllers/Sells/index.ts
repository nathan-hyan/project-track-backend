import createError from '@helpers/createError';
import Products from '@models/Products';
import { Product } from '@interfaces/product';
import Sells from '@models/Sells';
import { NextFunction, Request, Response } from 'express';
import { ErrorResponse } from '@interfaces/error';

interface CartProduct {
  item: string;
  quantity: number;
}

interface CustomProductResponse {
  _id: string;
  stock: number;
  name: string;
}

async function checkForStock(cartProducts: CartProduct[]) {
  const ALL_PRODUCTS = await Products.find({}, 'name stock');
  const found: CartProduct[] = [];

  cartProducts.map((cartItem: CartProduct) => {
    return found.push(
      ALL_PRODUCTS.find(
        (item: CustomProductResponse) =>
          item._id.toString() === cartItem.item.toString() && item.stock < cartItem.quantity,
      ),
    );
  });

  return !found.filter(Boolean).length;
}

async function subtractFromStock(productId: string, quantity: number) {
  const currentStock = await Products.findOne({ _id: productId }, 'stock');

  Products.findOneAndUpdate({ _id: productId }, { stock: currentStock.stock - quantity }).then(() => {
    console.log('ok!');
    return currentStock;
  });
}

const createSell = async (req: Request, res: Response, next: NextFunction) => {
  if (await checkForStock(req.body.products)) {
    req.body.products.map((current: CartProduct) => subtractFromStock(current.item, current.quantity));

    new Sells(req.body)
      .save()
      .then((sellsCreationResponse) => {
        res.send({
          success: true,
          data: sellsCreationResponse,
        });
      })
      .catch((err) => createError(next, res, err.message, err.status));
  } else {
    createError(next, res, 'Not enough stock', 400);
  }
};

const getSell = (req: Request, res: Response, next: NextFunction) => {
  Sells.findOne({ _id: req.params.id })
    .then((response: Product[]) => {
      res.send({ success: true, data: response });
    })
    .catch((err: ErrorResponse) => createError(next, res, err.message, err.status));
};

const getSellList = (req: Request, res: Response, next: NextFunction) => {
  Sells.find({})
    .then((response: Product[]) => {
      res.send({ success: true, data: response });
    })
    .catch((err: ErrorResponse) => createError(next, res, err.message, err.status));
};

const editSell = (req: Request, res: Response, next: NextFunction) => {
  Sells.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then((response: Product[]) => {
      res.send({ success: true, data: response });
    })
    .catch((err: ErrorResponse) => createError(next, res, err.message, err.status));
};

const deleteSell = (req: Request, res: Response, next: NextFunction) => {
  Sells.findOneAndDelete({ _id: req.params.id })
    .then((response: Product[]) => {
      res.send({ success: true, data: response });
    })
    .catch((err: ErrorResponse) => createError(next, res, err.message, err.status));
};

export default {
  createSell,
  getSell,
  getSellList,
  editSell,
  deleteSell,
};
