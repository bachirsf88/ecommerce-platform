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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">
            {item.product?.name || 'Unnamed product'}
          </h3>
          <p className="text-sm text-slate-600">
            Category: {item.product?.category || 'Uncategorized'}
          </p>
          <p className="text-sm text-slate-600">Unit Price: ${item.unit_price}</p>
          <p className="text-sm font-medium text-slate-900">
            Subtotal: ${item.subtotal}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor={`quantity-${item.id}`}
              className="text-sm font-medium text-slate-700"
            >
              Quantity
            </label>
            <input
              id={`quantity-${item.id}`}
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="mt-2 w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            Update
          </button>

          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
