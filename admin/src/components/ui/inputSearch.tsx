import { Sparkles } from "lucide-react";

interface InputSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  value: string;
  setValue: (query: string) => void;
  numberProfils?: number;
}

export function InputSearch({ 
  placeholder = "Rechercher...", 
  onSearch, 
  value, 
  setValue, 
  numberProfils 
}: InputSearchProps) {

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value);
    }
  };

  return (
    <div className="w-full flex items-center border border-gray-300 rounded-full px-6 py-2 focus-within:ring-2 focus-within:ring-green-500">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-gray-700 outline-none bg-transparent py-2"
        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
      />
      {numberProfils !== undefined && (
        <span className="ml-4 text-sm text-white bg-sidebar-primary rounded-md px-4 py-2">
          {numberProfils} profil{numberProfils > 1 ? "s" : ""}
        </span>
      )}
      <button
        className="flex items-center justify-center text-green-500 ml-4"
        onClick={handleSearch}
      >
        <Sparkles className="text-sidebar-primary" size={20} fill="currentColor" />
      </button>
    </div>
  );
}
