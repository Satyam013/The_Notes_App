export default function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <div className="my-3 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-green-700">
      {message}
    </div>
  );
}
