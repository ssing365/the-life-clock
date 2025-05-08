interface QuoteProps {
  quote: {
    text: string;
    author: string;
  };
}

export default function Quote({ quote }: QuoteProps) {
  return (
    <p className="font-serif text-center text-sm text-gray-400 italic mt-4">
      "{quote.text}" – {quote.author}
    </p>
  );
} 