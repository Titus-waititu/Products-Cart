import "./style.css";
import { DatabaseService } from "./Database.service";
import type { TProduct } from "./Type";

const dbService = new DatabaseService();
let cartCount = 0;
const cartNum = document.querySelector<HTMLSpanElement>(".cart-count")!;

async function getData() {
  await dbService.initDatabase();
  const response = await fetch("../data.json");
  const data = await response.json();
  displayData(data);
  await loadCart();
}

function displayData(data: any) {
  const DessertsContainer =
    document.querySelector<HTMLDivElement>(".desserts-container") ??
    document.createElement("div");
  DessertsContainer.classList.add("desserts-container");

  data.forEach((item: any) => {
    const items = document.createElement("div");
    const image = document.createElement("img");
    const addToCartContainer = document.createElement("div");
    const addBtn = document.createElement("button");
    const incrementBtn = document.createElement("button");
    const decrementBtn = document.createElement("button");
    const quantityDisplay = document.createElement("span");
    const name = document.createElement("h2");
    const category = document.createElement("h3");
    const price = document.createElement("p");

    items.classList.add("items");
    image.classList.add("image");
    addToCartContainer.classList.add("add-to-cart-container");
    addBtn.classList.add("addBtn");
    incrementBtn.classList.add("incBtn");
    decrementBtn.classList.add("decBtn");
    quantityDisplay.classList.add("quantity-display");
    name.classList.add("name");
    category.classList.add("category");
    price.classList.add("price");

    image.src = item.image["desktop"];
    image.alt = item.name;
    addBtn.innerText = "Add to Cart";
    incrementBtn.innerText = "+";
    decrementBtn.innerText = "−";
    quantityDisplay.innerText = "1";

    name.innerText = item.name;
    category.innerText = item.category;
    price.innerText = `$${item.price}`;

    let quantity = 1;

    incrementBtn.addEventListener("click", () => {
      quantity++;
      quantityDisplay.innerText = quantity.toString();
    });

    decrementBtn.addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;
        quantityDisplay.innerText = quantity.toString();
      }
    });

    addBtn.addEventListener("click", async () => {
        const product: TProduct = {
          
          name: item.name,
          price: item.price,
          category: item.category,
          image: item.image["desktop"],
          quantity: quantity,
        }
        await dbService.addToCart(product);
        // product.id = id;
        updateCartUI(product, true);
      
    });

    addToCartContainer.appendChild(decrementBtn);
    addToCartContainer.appendChild(quantityDisplay);
    addToCartContainer.appendChild(incrementBtn);
    addToCartContainer.appendChild(addBtn);

    items.appendChild(image);
    items.appendChild(addToCartContainer);
    items.appendChild(name);
    items.appendChild(category);
    items.appendChild(price);
    DessertsContainer.appendChild(items);
  });

  const mainContainer = document.querySelector<HTMLDivElement>("#app")!;
  if (!mainContainer.contains(DessertsContainer)) {
    mainContainer.appendChild(DessertsContainer);
  }
}

function updateCartUI(product: TProduct, isNew: boolean = false) {
  const cart = document.querySelector<HTMLDivElement>(".cart")!;
  const cartItems = document.createElement("div");
  cartItems.classList.add("cart-items");
  cartItems.setAttribute("data-id", String(product.id));

  cartItems.innerHTML = `

    <div class="cart-item">
      <div class="cart-item-name">
        <h2>${product.name}</h2>
        <div class="cart-item-quantity">
          <p><span>${product.quantity}</span> x</p>
          <p class="cart-item-price">@$${product.price}</p>
          <p class="cart-item-total">$${product.price * (product.quantity ?? 1)}</p>
        </div>
      </div>
      <p class="cancel">X</p>
    </div>
    
  `;

  cartItems.querySelector(".cancel")!.addEventListener("click", async () => {
    if (product.id !== undefined) {
      await dbService.deleteCartItem(product.name);
      cartItems.remove();
      cartCount -= product.quantity ??1;
      cartNum.innerText = cartCount.toString();
    }
  });
  
        // <p>This is a carbon neutral delivery</p>
        // <button class="confirmBtn">confirm order</button>
  cart.appendChild(cartItems);
  if (isNew) {
    cartCount += product.quantity ?? 1;
    cartNum.innerText = cartCount.toString();
  }
}

async function loadCart() {
  const cartItems = await dbService.getCartItems();
  cartCount = 0;
  cartItems.forEach((item: TProduct) => {
    updateCartUI(item);
    cartCount += item.quantity ?? 1;
  });
  cartNum.innerText = cartCount.toString();
}

getData();
