// database.service.ts
import type { TProduct } from "./Type";

export class DatabaseService {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'CartDB';
    private readonly STORE_NAME = 'cart';

    constructor() {
        this.initDatabase();
    }

    public initDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onerror = () => reject(request.error);

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('name', 'name', { unique: false });
                }
            };
        });
    }

    async addToCart(product: TProduct): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.add(product);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

   async deleteCartItem(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
    const store = transaction.objectStore(this.STORE_NAME);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        if (cursor.value.name === name) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        // No more records
        resolve();
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}


   async getCartItems(): Promise<TProduct[]> {
    return new Promise((resolve, reject) => {
        if (!this.db) return reject('Database not initialized');
        const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const items = request.result;
            resolve(items as TProduct[]);
        };

        request.onerror = () => reject(request.error);
    });
}

}