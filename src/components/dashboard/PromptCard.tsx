interface PromptCardProps {
  title: string;
  content: string;
}

export default function PromptCard({ title, content }: PromptCardProps) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5">
      <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">{content}</p>
    </div>
  );
}
