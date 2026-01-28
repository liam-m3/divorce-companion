interface InfoCardProps {
  title: string;
  content: string;
}

export default function InfoCard({ title, content }: InfoCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{content}</p>
    </div>
  );
}
