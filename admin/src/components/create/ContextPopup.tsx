import { Github, BookText, FileText } from "lucide-react";
import { useMemo } from "react";
import { SimbaDoc } from "@/types/document";

const integrations = [
  { name: "Notion", icon: <BookText className="h-5 w-5" />, type: "integration" },
];

interface ContextPopupProps {
  onSelect: (item: string) => void;
  query: string;
  documents: SimbaDoc[];
}

export function ContextPopup({
  onSelect,
  query,
  documents,
}: ContextPopupProps) {
  const allItems = useMemo(() => {
    const documentItems = documents.map((doc) => ({
      name: doc.title,
      icon: <FileText className="h-5 w-5" />,
      type: "document",
    }));
    return [...integrations, ...documentItems];
  }, [documents]);

  const filteredItems = useMemo(
    () =>
      allItems.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, allItems]
  );

  return (
    <div className="absolute z-10 w-64 bg-background border rounded-lg shadow-lg mt-2">
      <div className="p-2 font-semibold border-b">Reference</div>
      <ul className="py-1 max-h-60 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <li
              key={`${item.type}-${item.name}`}
              className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
              onClick={() => onSelect(item.name)}
            >
              {item.icon}
              <span>{item.name}</span>
            </li>
          ))
        ) : (
          <li className="px-3 py-2 text-muted-foreground text-sm">
            No results found
          </li>
        )}
      </ul>
    </div>
  );
} 