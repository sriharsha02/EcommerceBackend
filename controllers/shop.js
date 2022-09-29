const Product = require('../models/product');

const ITEMS_PER_PAGE = 2;
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.count()
  .then((total) => {
    totalItems = total;
    return Product.findAll({
      offset: (page - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE
    })
  })
  
    .then(products => {
      res.json({
        products : products,
        currentPage : page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      })
      // res.render('shop/product-list', {
      //   prods: products,
      //   pageTitle: 'All Products',
      //   path: '/products'
      // });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findByPk(prodId)
    .then(product => {
      res.json(product)
      // res.render('shop/product-detail', {
      //   product: product,
      //   pageTitle: product.title,
      //   path: '/products'
      // });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      // res.json(products)
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts()
        .then(products => {
          res.json({products, success:true})
          // res.render('shop/cart', {
          //   path: '/cart',
          //   pageTitle: 'Your Cart',
          //   products: products
          // });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  console.log('I am in post cart',req.body)
  const prodId = req.body.id;
  console.log(prodId+"=prodId")
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      prods = cart.getProducts({ where: { id: prodId } })
      
      return prods;
    })
    .then(products => {
      console.log(products.length)
      let product;
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        
        return product;
      }
      console.log(prodId)
      return Product.findByPk(prodId);
    })
    .then(product => {
      console.log(product);
      const quant = fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
      
      return quant;
    })
    .then(() => {
      
      res.status(200).json({success: true, message: 'Successfully added the product'});
    })
    .catch(err =>{
      console.log(err)
      res.status(500).json({success: false, message: 'Error Occured'});

    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      const getProd = cart.getProducts({ where: { id: prodId } });
      return getProd;
    })
    .then(products => {
      const product = products[0];
      const destroy =  product.cartItem.destroy();
      console.log(destroy);
      return destroy;
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;

      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch(err => {
          console.log(err)
          res.status(500).json({success: false, message: 'Error Occured'});
        }
          );
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      // res.redirect('/orders');
      res.status(200).json({success: true, message: 'Successfully bhot the product'});
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include: ['products']})
    .then(orders => {
      res.json({orders, success:true})

    })
    .catch(err => console.log(err));
};
