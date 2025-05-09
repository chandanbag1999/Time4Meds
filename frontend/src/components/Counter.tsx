import { useAppSelector, useAppDispatch } from '../store/hooks';
import { decrement, increment, incrementByAmount, selectCount } from '../store/slices/counterSlice';

export function Counter() {
  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Counter Example</h2>
      <div className="flex items-center gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
        <span className="text-2xl font-bold">{count}</span>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
      </div>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => dispatch(incrementByAmount(5))}
      >
        Add 5
      </button>
    </div>
  );
} 