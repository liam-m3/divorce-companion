interface PlaceholderCardProps {
  title: string;
  content: string;
}

export default function PlaceholderCard({ title, content }: PlaceholderCardProps) {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 border-dashed rounded-xl p-5 opacity-60">
      <h3 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 dark:text-zinc-500">{content}</p>
    </div>
  );
}
