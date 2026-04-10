import Link from 'next/link';
import { sites } from '@/lib/sites.config';

export default async function ComponentsListPage({ params }) {
  const { site } = await params;
  const config = sites[site];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Components</h1>
      <p className="text-sm text-gray-500 mb-8">Edit hardcoded data in JSX components</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.components.map((name) => (
          <Link
            key={name}
            href={`/${site}/components/${name}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand/30 hover:shadow-sm transition-all group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-400 mt-1">components/{name}.jsx</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
