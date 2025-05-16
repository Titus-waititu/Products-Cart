import './style.css';
import { DatabaseService } from './Database.service';
import type { TProduct } from './Type';

const dbService = new DatabaseService();
let cartCount = 0;

async function getData() {
  await dbService.initDatabase();
  const response = await fetch('../data.json');
  const data = await response.json();
  displayData(data);
  await loadCart();
}

function displayData(data: any) {
  const DessertsContainer = document.querySelector<HTMLDivElement>('.desserts-container')!;

  data.forEach((item: any) => {
    const items = document.createElement('div');
    const image = document.createElement('img');
    const addBtn = document.createElement('button');
    const name = document.createElement('h2');
    const category = document.createElement('h3');
    const price = document.createElement('p');

    items.classList.add('items');
    image.classList.add('image');
    addBtn.classList.add('addBtn');
    name.classList.add('name');
    category.classList.add('category');
    price.classList.add('price');

    image.src = item.image['desktop'];
    image.alt = item.name;
    addBtn.innerText = 'Add to Cart';
    name.innerText = item.name;
    category.innerText = item.category;
    price.innerText = `$${item.price}`;

    items.appendChild(image);
    items.appendChild(addBtn);
    items.appendChild(name);
    items.appendChild(category);
    items.appendChild(price);
    DessertsContainer.appendChild(items);

    addBtn.addEventListener('click', async () => {
      const product: TProduct = {
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image['desktop']
      };
      await dbService.addToCart(product);
      updateCartUI(product, true);
    });
  });

  const mainContainer = document.querySelector<HTMLDivElement>('#app')!;
  if (!mainContainer.contains(DessertsContainer)) {
    mainContainer.appendChild(DessertsContainer);
  }
}

function updateCartUI(product: TProduct, isNew: boolean = false) {
  const cart = document.querySelector<HTMLDivElement>('.cart')!;
  const cartItems = document.createElement('div');
  cartItems.classList.add('cart-items');

  const cartItemName = document.createElement('h2');
  const cartItemPrice = document.createElement('p');
  const cancel = document.createElement('p');

  cartItemName.innerText = product.name;
  cartItemPrice.innerText = `$${product.price}`;
  cancel.innerText = 'X';
  cancel.classList.add('cancel');

  cancel.addEventListener('click', async () => {
    dbService.deleteCartItem(product.id!);
    cartCount--;
    const cartCountElem = document.querySelector<HTMLSpanElement>('.cart-count')!;
    cartCountElem.innerText = cartCount.toString();

    const items = await dbService.getCartItems();
    const toDelete = items.find(i => i.name === product.name);
    if (toDelete && 'id' in toDelete && toDelete.id) {
      await dbService.deleteCartItem(toDelete.id);
    }
  });

  cartItems.appendChild(cancel);
  cartItems.appendChild(cartItemName);
  cartItems.appendChild(cartItemPrice);
  cart.appendChild(cartItems);

  if (isNew) {
    cartCount++;
    const cartCountElem = document.querySelector<HTMLSpanElement>('.cart-count')!;
    cartCountElem.innerText = cartCount.toString();
  }
}

async function loadCart() {
  const cartItems = await dbService.getCartItems();
  cartCount = cartItems.length;
  cartItems.forEach(item => updateCartUI(item));
  const cartCountElem = document.querySelector<HTMLSpanElement>('.cart-count')!;
  cartCountElem.innerText = cartCount.toString();
}

getData();
