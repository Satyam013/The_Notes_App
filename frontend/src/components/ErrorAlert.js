export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="my-3 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-red-700">
      {message}
    </div>
  );
}
