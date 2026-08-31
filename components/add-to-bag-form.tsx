"use client";

import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";

export function AddToBagForm({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[2] ?? product.sizes[0]); const [quantity, setQuantity] = useState(1); const [added, setAdded] = useState(false);
  return <div className="add-form"><div className="add-form-label"><label>SELECT SIZE</label><a href="#size-guide">SIZE GUIDE ↗</a></div><div className="size-options">{product.sizes.map((item) => <button type="button" key={item} className={size === item ? "selected" : ""} onClick={() => setSize(item)}>{item}</button>)}</div><div className="quantity-row"><label>QUANTITY</label><div className="quantity-control"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus size={15}/></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={15}/></button></div></div><button type="button" className="add-to-bag" onClick={() => setAdded(true)}><span>{added ? "ADDED TO BAG" : "ADD TO BAG"}</span><span>{formatPrice(product.price * quantity)} <ArrowRight size={17}/></span></button>{added && <p className="added-note">Added in size {size}. Cart backend connection required for checkout.</p>}</div>;
}
