import { useEffect, useState } from 'react';

function CartItem({ item, onUpdate, onRemove, loading }) {
  const [quantity, setQuantity] = useState(item.quantity);

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleUpdate = () => {
    onUpdate(item.id, quantity);
  };

  const handleRemove = () => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this item from the cart?'
    );

    if (!confirmed) {
      return;
    }

    onRemove(item.id);
  };

  return (
    <div className="data-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <span className="status-pill">Cart Item</span>
          <h3 className="font-display text-3xl leading-none text-[var(--color-primary)]">
            {item.product?.name || 'Unnamed product'}
          </h3>
          <p className="text-sm text-[rgba(2,2,2,0.68)]">
            Category: {item.product?.category || 'Uncategorized'}
          </p>
          <p className="text-sm text-[rgba(2,2,2,0.68)]">Unit Price: ${item.unit_price}</p>
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            Subtotal: ${item.subtotal}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor={`quantity-${item.id}`}
              className="text-sm font-semibold text-[rgba(2,2,2,0.72)]"
            >
              Quantity
            </label>
            <input
              id={`quantity-${item.id}`}
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="text-input mt-2 w-24"
            />
          </div>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="btn-base btn-primary"
          >
            Update
          </button>

          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="btn-base btn-danger"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
